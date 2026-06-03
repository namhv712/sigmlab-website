import { verifyToken, signToken, checkPasscode } from './auth.js'
import {
  allMatches,
  leaderboard,
  getOrCreateUser,
  getUserByName,
  userPicks,
  upsertPick,
  matchExists,
  setScore,
} from './db.js'

const LIVE_WINDOW = 150 * 60 // 150 minutes in seconds
const TOKEN_TTL = 30 * 24 * 60 * 60 // 30 days in seconds
const VALID_PICKS = new Set(['1', 'X', '2'])

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

export default async function routes(fastify) {
  const secret = process.env.WC_TOKEN_SECRET || ''
  const memberHash = process.env.WC_MEMBER_PASSCODE_HASH || ''
  const adminHash = process.env.WC_ADMIN_PASSCODE_HASH || ''

  // 5 attempts burst, refill 1 per 10s
  const loginLimiter = makeRateLimiter({ capacity: 5, refillPerSec: 0.1 })
  // 30 writes burst, refill 1 per 2s
  const pickLimiter = makeRateLimiter({ capacity: 30, refillPerSec: 0.5 })

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
    let picks = {}
    if (name) {
      const u = getUserByName(String(name))
      if (u) picks = userPicks(u.id)
    }
    return {
      matches: ms.map((m) => ({
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
        status: deriveStatus(m, now),
        ...(name ? { myPick: picks[m.id] ?? null } : {}),
      })),
    }
  })

  // GET /leaderboard  (public)
  fastify.get('/leaderboard', async () => ({ rows: leaderboard() }))

  // POST /login {name, passcode} → {token}
  fastify.post('/login', async (req, reply) => {
    if (!loginLimiter.take(req.ip)) {
      return reply.code(429).send({ error: 'rate_limited' })
    }
    const { name, passcode } = req.body || {}
    if (typeof name !== 'string' || !name.trim() || typeof passcode !== 'string') {
      return reply.code(400).send({ error: 'bad_request' })
    }
    if (!checkPasscode(passcode, memberHash)) {
      return reply.code(401).send({ error: 'bad_passcode' })
    }
    const cleanName = name.trim().slice(0, 40)
    const user = getOrCreateUser(cleanName)
    const exp = Math.floor(Date.now() / 1000) + TOKEN_TTL
    const token = signToken(user.name, secret, exp)
    return { token }
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
    upsertPick(user.id, matchId, pick)
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
}
