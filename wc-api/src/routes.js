import { verifyToken, signToken, checkPasscode, hashPassword, verifyPassword } from './auth.js'
import {
  allMatches,
  leaderboard,
  getUserByName,
  createUserWithPassword,
  setUserPassword,
  userPicks,
  userPickRows,
  getUserName,
  picksByMatch,
  upsertPick,
  matchExists,
  setScore,
  getFollow,
  setFollow,
  clearFollow,
  resyncFromTarget,
  propagateToFollowers,
  allFollows,
} from './db.js'
import { updateResults } from './results.js'

const LIVE_WINDOW = 150 * 60 // 150 minutes in seconds
const TOKEN_TTL = 30 * 24 * 60 * 60 // 30 days in seconds
const VALID_PICKS = new Set(['1', 'X', '2'])
const MAX_NAME = 40
const MIN_PW = 4
const MAX_PW = 128

function deriveStatus(m, now) {
  if (now < m.kickoff_utc) return 'upcoming'
  const hasScore = m.score1 != null && m.score2 != null
  if (!hasScore && now < m.kickoff_utc + LIVE_WINDOW) return 'live'
  return 'finished'
}

// Tiny in-memory token-bucket rate limiter, keyed by IP.
// Returns an object with .take(key) → true if a token was available.
function makeRateLimiter({ capacity, refillPerSec }) {
  const buckets = new Map()
  function take(key) {
    const now = Date.now() / 1000
    let b = buckets.get(key)
    if (!b) {
      b = { tokens: capacity, ts: now }
      buckets.set(key, b)
    }
    b.tokens = Math.min(capacity, b.tokens + (now - b.ts) * refillPerSec)
    b.ts = now
    if (b.tokens < 1) return false
    b.tokens -= 1
    return true
  }
  return { take }
}

function bearer(req) {
  const h = req.headers['authorization'] || ''
  const m = /^Bearer\s+(.+)$/i.exec(h)
  return m ? m[1] : null
}

function parseCookies(req) {
  const out = {}
  const h = req.headers['cookie']
  if (!h) return out
  for (const part of h.split(';')) {
    const i = part.indexOf('=')
    if (i < 0) continue
    out[part.slice(0, i).trim()] = part.slice(i + 1).trim()
  }
  return out
}

export default async function routes(fastify) {
  const secret = process.env.WC_TOKEN_SECRET || ''
  const adminHash = process.env.WC_ADMIN_PASSCODE_HASH || ''

  // View gate: a single shared passcode unlocks the whole WC tab. On success
  // we set an opaque, HttpOnly cookie whose value matches WC_VIEW_COOKIE; every
  // data/login route then requires that cookie. Fail-open when unconfigured so
  // local/dev and the test suite keep working without the env set.
  const viewHash = process.env.WC_VIEW_PASSCODE_HASH || ''
  const viewCookie = process.env.WC_VIEW_COOKIE || ''

  function hasView(req) {
    if (!viewCookie) return true // gate disabled when unconfigured
    return parseCookies(req).wc_view === viewCookie
  }

  // Block everything except obtaining the cookie (/view) and admin scoring
  // (which carries its own passcode header) until the view cookie is present.
  fastify.addHook('onRequest', async (req, reply) => {
    const path = req.url.split('?')[0]
    if (path === '/view' || path.startsWith('/admin/')) return
    if (!hasView(req)) return reply.code(401).send({ error: 'view_locked' })
  })

  // 5 attempts burst, refill 1 per 10s
  const loginLimiter = makeRateLimiter({ capacity: 5, refillPerSec: 0.1 })
  // registration: same shape, separate bucket from login
  const registerLimiter = makeRateLimiter({ capacity: 5, refillPerSec: 0.1 })
  // view-gate unlock: same shape as login limiter
  const viewLimiter = makeRateLimiter({ capacity: 5, refillPerSec: 0.1 })
  // admin password reset: throttle brute force against the shared admin passcode
  const adminLimiter = makeRateLimiter({ capacity: 5, refillPerSec: 0.1 })
  // 30 writes burst, refill 1 per 2s
  const pickLimiter = makeRateLimiter({ capacity: 30, refillPerSec: 0.5 })
  // follow/unfollow: same shape as the pick limiter (a follow can fan out picks)
  const followLimiter = makeRateLimiter({ capacity: 30, refillPerSec: 0.5 })

  // POST /view {passcode} → sets the shared view cookie on success.
  fastify.post('/view', async (req, reply) => {
    if (!viewLimiter.take(req.ip)) {
      return reply.code(429).send({ error: 'rate_limited' })
    }
    const { passcode } = req.body || {}
    if (typeof passcode !== 'string' || !checkPasscode(passcode, viewHash)) {
      return reply.code(401).send({ error: 'bad_passcode' })
    }
    const maxAge = 30 * 24 * 60 * 60 // 30 days
    reply.header(
      'Set-Cookie',
      `wc_view=${viewCookie}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`,
    )
    return { ok: true }
  })

  function authUser(req) {
    const tok = bearer(req)
    if (!tok) return null
    const payload = verifyToken(tok, secret)
    if (!payload) return null
    return getUserByName(payload.name) || null
  }

  // GET /schedule  (public; ?name= attaches caller's pick per match)
  fastify.get('/schedule', async (req) => {
    const now = Math.floor(Date.now() / 1000)
    const ms = allMatches()
    const name = req.query && req.query.name
    let pickRows = {}
    let activeFollow = null
    if (name) {
      const u = getUserByName(String(name))
      if (u) {
        pickRows = userPickRows(u.id)
        activeFollow = getFollow(u.id)
      }
    }
    // Everyone's picks per match — attached ONLY to finished matches so a
    // pending match never leaks who bet what before it's locked.
    const allPicks = picksByMatch()
    return {
      matches: ms.map((m) => {
        const status = deriveStatus(m, now)
        // Caller's own pick. A COPIED pick on an UPCOMING match stays blind: we
        // expose that it's covered (and by whom) but withhold the value until
        // kickoff — same secrecy rule as a manual pick.
        let mine = {}
        if (name) {
          const row = pickRows[m.id] ?? null
          if (!row) {
            mine =
              activeFollow && status === 'upcoming'
                ? { myPick: null, copying: true, copyingFrom: activeFollow.targetName }
                : { myPick: null, copying: false }
          } else if (row.copiedFrom != null && status === 'upcoming') {
            mine = { myPick: null, copying: true, copyingFrom: getUserName(row.copiedFrom) }
          } else {
            mine = { myPick: row.pick, copying: row.copiedFrom != null }
          }
        }
        return {
          id: m.id,
          stage: m.stage,
          round: m.round,
          group: m.group,
          kickoff: m.kickoff_utc,
          team1: m.team1,
          team2: m.team2,
          ground: m.ground,
          score1: m.score1,
          score2: m.score2,
          status,
          ...mine,
          ...(status === 'finished' ? { picks: allPicks.get(m.id) || [] } : {}),
        }
      }),
    }
  })

  // GET /leaderboard  (public)
  fastify.get('/leaderboard', async () => ({ rows: leaderboard() }))

  // Validate a {name, password} body. Returns a cleaned name or null.
  function cleanCredentials(name, password) {
    if (typeof name !== 'string' || !name.trim()) return null
    if (typeof password !== 'string' || password.length < MIN_PW || password.length > MAX_PW) {
      return null
    }
    return name.trim().slice(0, MAX_NAME)
  }

  // POST /register {name, password} → {token}. Each member owns their password.
  fastify.post('/register', async (req, reply) => {
    if (!registerLimiter.take(req.ip)) {
      return reply.code(429).send({ error: 'rate_limited' })
    }
    const { name, password } = req.body || {}
    const cleanName = cleanCredentials(name, password)
    if (!cleanName) return reply.code(400).send({ error: 'bad_request' })

    const { hash, salt } = hashPassword(password)
    const existing = getUserByName(cleanName)
    if (existing) {
      if (existing.pass_hash) return reply.code(409).send({ error: 'name_taken' })
      // Legacy/unclaimed name (created before passwords existed): claim it.
      setUserPassword(cleanName, hash, salt)
    } else {
      createUserWithPassword(cleanName, hash, salt)
    }
    const exp = Math.floor(Date.now() / 1000) + TOKEN_TTL
    return { token: signToken(cleanName, secret, exp) }
  })

  // POST /login {name, password} → {token}. Verifies the per-user password.
  fastify.post('/login', async (req, reply) => {
    if (!loginLimiter.take(req.ip)) {
      return reply.code(429).send({ error: 'rate_limited' })
    }
    const { name, password } = req.body || {}
    if (typeof name !== 'string' || !name.trim() || typeof password !== 'string') {
      return reply.code(400).send({ error: 'bad_request' })
    }
    const cleanName = name.trim().slice(0, MAX_NAME)
    const user = getUserByName(cleanName)
    // Single generic failure — never reveal whether the name exists.
    if (!user || !user.pass_hash || !verifyPassword(password, user.pass_hash, user.pass_salt)) {
      return reply.code(401).send({ error: 'bad_login' })
    }
    const exp = Math.floor(Date.now() / 1000) + TOKEN_TTL
    return { token: signToken(user.name, secret, exp) }
  })

  // GET /mypicks  (Bearer)
  fastify.get('/mypicks', async (req, reply) => {
    const user = authUser(req)
    if (!user) return reply.code(401).send({ error: 'unauthorized' })
    return { picks: userPicks(user.id) }
  })

  // POST /picks {matchId, pick}  (Bearer)
  fastify.post('/picks', async (req, reply) => {
    const user = authUser(req)
    if (!user) return reply.code(401).send({ error: 'unauthorized' })
    if (!pickLimiter.take(req.ip)) {
      return reply.code(429).send({ error: 'rate_limited' })
    }
    const { matchId, pick } = req.body || {}
    if (typeof matchId !== 'string' || !VALID_PICKS.has(pick)) {
      return reply.code(400).send({ error: 'bad_pick' })
    }
    const m = allMatches().find((x) => x.id === matchId)
    if (!m) return reply.code(400).send({ error: 'unknown_match' })
    const now = Math.floor(Date.now() / 1000)
    if (now >= m.kickoff_utc) {
      return reply.code(423).send({ error: 'locked' })
    }
    // Manual pick (copied_from = null) always wins, then mirror it to anyone
    // following this user who hasn't manually overridden the same match.
    upsertPick(user.id, matchId, pick)
    propagateToFollowers(user.id, matchId, pick, now)
    return { ok: true }
  })

  // GET /follow → { following: name|null }  (Bearer) — who the caller copies.
  fastify.get('/follow', async (req, reply) => {
    const user = authUser(req)
    if (!user) return reply.code(401).send({ error: 'unauthorized' })
    const f = getFollow(user.id)
    return { following: f ? f.targetName : null }
  })

  // GET /follows → { follows: [{ follower, target }] }  (public) — the whole
  // copy graph so everyone can see who is copying who, level by level.
  fastify.get('/follows', async () => ({ follows: allFollows() }))

  // POST /follow {targetName}  (Bearer) — start copying targetName's future
  // picks. Replaces any existing follow, then fills the caller's empty upcoming
  // matches from the target. Returns how many matches were filled.
  fastify.post('/follow', async (req, reply) => {
    const user = authUser(req)
    if (!user) return reply.code(401).send({ error: 'unauthorized' })
    if (!followLimiter.take(req.ip)) {
      return reply.code(429).send({ error: 'rate_limited' })
    }
    const { targetName } = req.body || {}
    if (typeof targetName !== 'string' || !targetName.trim()) {
      return reply.code(400).send({ error: 'bad_request' })
    }
    const target = getUserByName(targetName.trim().slice(0, MAX_NAME))
    if (!target) return reply.code(404).send({ error: 'unknown_user' })
    if (target.id === user.id) return reply.code(400).send({ error: 'cannot_follow_self' })
    setFollow(user.id, target.id)
    const now = Math.floor(Date.now() / 1000)
    // Fresh copy action: every still-open match now defaults to this target.
    // Later manual taps remain one-match overrides.
    const filled = resyncFromTarget(user.id, target.id, now, new Set(), {
      manualMode: 'replace',
    })
    return { ok: true, following: target.name, filled }
  })

  // POST /unfollow  (Bearer) — stop copying. Already-materialized picks stay
  // (sticky); only future auto-fill/propagation stops.
  fastify.post('/unfollow', async (req, reply) => {
    const user = authUser(req)
    if (!user) return reply.code(401).send({ error: 'unauthorized' })
    clearFollow(user.id)
    return { ok: true }
  })

  // POST /admin/result {matchId, score1, score2}  (x-admin-passcode header)
  fastify.post('/admin/result', async (req, reply) => {
    const pass = req.headers['x-admin-passcode']
    if (typeof pass !== 'string' || !checkPasscode(pass, adminHash)) {
      return reply.code(401).send({ error: 'unauthorized' })
    }
    const { matchId, score1, score2 } = req.body || {}
    if (
      typeof matchId !== 'string' ||
      !Number.isInteger(score1) ||
      !Number.isInteger(score2) ||
      score1 < 0 ||
      score2 < 0
    ) {
      return reply.code(400).send({ error: 'bad_request' })
    }
    if (!matchExists(matchId)) {
      return reply.code(400).send({ error: 'unknown_match' })
    }
    setScore(matchId, score1, score2)
    return { ok: true }
  })

  // POST /admin/reset-password {name, newPassword}  (x-admin-passcode header)
  // Lets the admin reset a member's forgotten betting password.
  fastify.post('/admin/reset-password', async (req, reply) => {
    if (!adminLimiter.take(req.ip)) {
      return reply.code(429).send({ error: 'rate_limited' })
    }
    const pass = req.headers['x-admin-passcode']
    if (typeof pass !== 'string' || !checkPasscode(pass, adminHash)) {
      return reply.code(401).send({ error: 'unauthorized' })
    }
    const { name, newPassword } = req.body || {}
    if (
      typeof name !== 'string' ||
      !name.trim() ||
      typeof newPassword !== 'string' ||
      newPassword.length < MIN_PW ||
      newPassword.length > MAX_PW
    ) {
      return reply.code(400).send({ error: 'bad_request' })
    }
    const cleanName = name.trim().slice(0, MAX_NAME)
    const { hash, salt } = hashPassword(newPassword)
    if (!setUserPassword(cleanName, hash, salt)) {
      return reply.code(404).send({ error: 'unknown_user' })
    }
    return { ok: true }
  })

  // POST /admin/refresh  (x-admin-passcode header) — pull the latest FINISHED
  // results from the upstream scores feed and apply them. Idempotent; meant to
  // be poked by the server cron every few minutes during the tournament.
  fastify.post('/admin/refresh', async (req, reply) => {
    const pass = req.headers['x-admin-passcode']
    if (typeof pass !== 'string' || !checkPasscode(pass, adminHash)) {
      return reply.code(401).send({ error: 'unauthorized' })
    }
    const updated = await updateResults()
    return { ok: true, updated }
  })
}
