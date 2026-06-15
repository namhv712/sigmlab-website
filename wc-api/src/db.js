import { DatabaseSync } from 'node:sqlite'
import { result, FINE_WRONG, FINE_MISS } from './scoring.js'

const db = new DatabaseSync(process.env.WC_DB || './wc.db')

db.exec(`
  CREATE TABLE IF NOT EXISTS matches (
    id TEXT PRIMARY KEY,
    stage TEXT,
    round TEXT,
    "group" TEXT,
    kickoff_utc INTEGER,
    team1 TEXT,
    team2 TEXT,
    ground TEXT,
    score1 INTEGER,
    score2 INTEGER,
    updated_at INTEGER
  );
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    created_at INTEGER,
    pass_hash TEXT,
    pass_salt TEXT
  );
  CREATE TABLE IF NOT EXISTS picks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    match_id TEXT,
    pick TEXT,
    updated_at INTEGER,
    copied_from INTEGER,
    UNIQUE(user_id, match_id)
  );
  CREATE TABLE IF NOT EXISTS follows (
    follower_id INTEGER PRIMARY KEY,
    target_id INTEGER NOT NULL,
    created_at INTEGER
  );
`)

// Migrate pre-existing DBs created before per-user passwords: add the
// credential columns if they are missing (existing rows get NULL).
const userCols = db.prepare(`PRAGMA table_info(users)`).all().map((c) => c.name)
if (!userCols.includes('pass_hash')) db.exec(`ALTER TABLE users ADD COLUMN pass_hash TEXT`)
if (!userCols.includes('pass_salt')) db.exec(`ALTER TABLE users ADD COLUMN pass_salt TEXT`)

// Migrate DBs created before copy-betting: a pick now records who it was copied
// from (NULL = the user's own manual pick).
const pickCols = db.prepare(`PRAGMA table_info(picks)`).all().map((c) => c.name)
if (!pickCols.includes('copied_from')) db.exec(`ALTER TABLE picks ADD COLUMN copied_from INTEGER`)

const now = () => Math.floor(Date.now() / 1000)

const stUpsertMatch = db.prepare(`
  INSERT INTO matches (id, stage, round, "group", kickoff_utc, team1, team2, ground, score1, score2, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET
    stage=excluded.stage,
    round=excluded.round,
    "group"=excluded."group",
    kickoff_utc=excluded.kickoff_utc,
    team1=excluded.team1,
    team2=excluded.team2,
    ground=excluded.ground,
    score1=COALESCE(excluded.score1, matches.score1),
    score2=COALESCE(excluded.score2, matches.score2),
    updated_at=excluded.updated_at
`)

export function upsertMatch(m) {
  stUpsertMatch.run(
    m.id,
    m.stage ?? null,
    m.round ?? null,
    m.group ?? null,
    m.kickoff_utc ?? null,
    m.team1 ?? null,
    m.team2 ?? null,
    m.ground ?? null,
    m.score1 ?? null,
    m.score2 ?? null,
    now()
  )
}

const stAllMatches = db.prepare(
  `SELECT id, stage, round, "group" AS "group", kickoff_utc, team1, team2, ground, score1, score2, updated_at
   FROM matches ORDER BY kickoff_utc ASC, id ASC`
)
export const allMatches = () => stAllMatches.all()

const stSetScore = db.prepare(
  `UPDATE matches SET score1=?, score2=?, updated_at=? WHERE id=?`
)
export function setScore(id, s1, s2) {
  const res = stSetScore.run(s1 == null ? null : s1, s2 == null ? null : s2, now(), id)
  return res.changes > 0
}

const stGetUserByName = db.prepare(
  `SELECT id, name, created_at, pass_hash, pass_salt FROM users WHERE name=?`
)
export const getUserByName = (name) => stGetUserByName.get(name)

const stCreateUser = db.prepare(`INSERT INTO users (name, created_at) VALUES (?, ?)`)
export function createUser(name) {
  const res = stCreateUser.run(name, now())
  return { id: Number(res.lastInsertRowid), name, created_at: now() }
}

export function getOrCreateUser(name) {
  return getUserByName(name) || createUser(name)
}

// Create a user that owns a password (used by /register).
const stCreateUserPw = db.prepare(
  `INSERT INTO users (name, created_at, pass_hash, pass_salt) VALUES (?, ?, ?, ?)`
)
export function createUserWithPassword(name, hash, salt) {
  const t = now()
  const res = stCreateUserPw.run(name, t, hash, salt)
  return { id: Number(res.lastInsertRowid), name, created_at: t }
}

// Set/replace a user's password (register-claim of an unclaimed name, or
// admin reset). Returns true if an existing row was updated.
const stSetUserPw = db.prepare(`UPDATE users SET pass_hash=?, pass_salt=? WHERE name=?`)
export function setUserPassword(name, hash, salt) {
  const res = stSetUserPw.run(hash, salt, name)
  return res.changes > 0
}

const stMatchExists = db.prepare(`SELECT 1 FROM matches WHERE id=?`)
export const matchExists = (id) => !!stMatchExists.get(id)

const stUpsertPick = db.prepare(`
  INSERT INTO picks (user_id, match_id, pick, updated_at, copied_from)
  VALUES (?, ?, ?, ?, ?)
  ON CONFLICT(user_id, match_id) DO UPDATE SET
    pick=excluded.pick, updated_at=excluded.updated_at, copied_from=excluded.copied_from
`)
// copiedFrom = null → the user's own manual pick; a user_id → copied from them.
export function upsertPick(userId, matchId, pick, copiedFrom = null) {
  stUpsertPick.run(userId, matchId, pick, now(), copiedFrom == null ? null : copiedFrom)
}

const stUserPicks = db.prepare(`SELECT match_id, pick FROM picks WHERE user_id=?`)
export function userPicks(userId) {
  const rows = stUserPicks.all(userId)
  const out = {}
  for (const r of rows) out[r.match_id] = r.pick
  return out
}

// Like userPicks but keeps provenance: { matchId: { pick, copiedFrom } }.
// copiedFrom is the user_id this pick was copied from, or null for a manual pick.
const stUserPickRows = db.prepare(`SELECT match_id, pick, copied_from FROM picks WHERE user_id=?`)
export function userPickRows(userId) {
  const out = {}
  for (const r of stUserPickRows.all(userId)) {
    out[r.match_id] = { pick: r.pick, copiedFrom: r.copied_from ?? null }
  }
  return out
}

const stUserById = db.prepare(`SELECT name FROM users WHERE id=?`)
export const getUserName = (id) => stUserById.get(id)?.name ?? null

// Every pick joined to its picker's name, grouped by match id:
//   Map<matchId, [{ name, pick }]>  (names sorted A→Z within each match).
// Used to reveal "who picked what" — only ever exposed for matches whose
// kickoff has passed (picks are locked then), never for upcoming ones.
const stPicksWithNames = db.prepare(
  `SELECT p.match_id AS matchId, u.name AS name, p.pick AS pick, cu.name AS copiedFrom
   FROM picks p
   JOIN users u ON u.id = p.user_id
   LEFT JOIN users cu ON cu.id = p.copied_from`
)
export function picksByMatch() {
  const out = new Map()
  for (const r of stPicksWithNames.all()) {
    let arr = out.get(r.matchId)
    if (!arr) {
      arr = []
      out.set(r.matchId, arr)
    }
    arr.push(r.copiedFrom ? { name: r.name, pick: r.pick, copiedFrom: r.copiedFrom } : { name: r.name, pick: r.pick })
  }
  for (const arr of out.values()) arr.sort((a, b) => a.name.localeCompare(b.name))
  return out
}

// --- Copy-betting (live follow) -------------------------------------------
// One active follow per user (follower_id is the primary key). Following a new
// person replaces the old target.
const stGetFollow = db.prepare(
  `SELECT f.target_id AS targetId, u.name AS targetName
   FROM follows f JOIN users u ON u.id = f.target_id WHERE f.follower_id = ?`
)
export const getFollow = (followerId) => stGetFollow.get(followerId) ?? null

const stSetFollow = db.prepare(`
  INSERT INTO follows (follower_id, target_id, created_at) VALUES (?, ?, ?)
  ON CONFLICT(follower_id) DO UPDATE SET target_id=excluded.target_id, created_at=excluded.created_at
`)
export function setFollow(followerId, targetId) {
  stSetFollow.run(followerId, targetId, now())
}

const stClearFollow = db.prepare(`DELETE FROM follows WHERE follower_id=?`)
export function clearFollow(followerId) {
  stClearFollow.run(followerId)
}

const stFollowersOf = db.prepare(`SELECT follower_id AS id FROM follows WHERE target_id=?`)
export const followersOf = (targetId) => stFollowersOf.all(targetId).map((r) => r.id)

const stPickRow = db.prepare(`SELECT pick, copied_from FROM picks WHERE user_id=? AND match_id=?`)
const stMatchKickoff = db.prepare(`SELECT kickoff_utc FROM matches WHERE id=?`)
// The target's own upcoming picks (kickoff still ahead of `nowSec`).
const stUpcomingPicksOf = db.prepare(
  `SELECT p.match_id AS matchId, p.pick AS pick
   FROM picks p JOIN matches m ON m.id = p.match_id
   WHERE p.user_id = ? AND m.kickoff_utc > ?`
)

// Propagate one (target → match → pick) change to the target's followers, then
// recurse so follow-chains (A→B→C) mirror too. Sticky + idempotent + manual-wins
// rules make this safe against cycles: an originator's manual pick blocks the
// loop, and re-applying an identical value is a no-op.
export function propagateToFollowers(targetId, matchId, pick, nowSec) {
  const m = stMatchKickoff.get(matchId)
  if (!m || m.kickoff_utc <= nowSec) return // only mirror while the match is still open
  for (const fId of followersOf(targetId)) {
    const existing = stPickRow.get(fId, matchId)
    if (existing) {
      if (existing.copied_from == null) continue // manual override wins
      if (existing.copied_from !== targetId) continue // copied from a different target — sticky
      if (existing.pick === pick) continue // idempotent
    }
    upsertPick(fId, matchId, pick, targetId)
    propagateToFollowers(fId, matchId, pick, nowSec)
  }
}

// Initial fill when `followerId` starts following `targetId`: copy the target's
// current upcoming picks into matches the follower has NO pick row for yet
// (sticky — never clobbers a manual pick or a copy from a previous target).
// Each filled pick also propagates down the follower's own chain. Returns count.
export function fillFromTarget(followerId, targetId, nowSec) {
  let filled = 0
  for (const tp of stUpcomingPicksOf.all(targetId, nowSec)) {
    if (stPickRow.get(followerId, tp.matchId)) continue // sticky
    upsertPick(followerId, tp.matchId, tp.pick, targetId)
    propagateToFollowers(followerId, tp.matchId, tp.pick, nowSec)
    filled += 1
  }
  return filled
}

// Leaderboard (penalty-only money model). EVERY finished match counts for
// EVERY user, regardless of when they registered: a user with no pick on a
// finished match is fined FINE_MISS ("không chọn"), a wrong pick FINE_WRONG,
// a correct pick costs nothing. `vnd` is the net total (≤ 0). This is why a
// member who registers late still owes 100k for each already-played match.
// Order: vnd asc (MOST owed on top — it's a penalty "shame board"), then
// fewer-correct, then earlier signup.
const stFinishedMatches = db.prepare(
  `SELECT id, score1, score2 FROM matches WHERE score1 IS NOT NULL AND score2 IS NOT NULL`
)
const stAllPicks = db.prepare(`SELECT user_id, match_id, pick FROM picks`)
const stAllUsers = db.prepare(`SELECT id, name, created_at FROM users`)

export function leaderboard() {
  const finished = stFinishedMatches.all()
  const picksByUser = new Map()
  for (const p of stAllPicks.all()) {
    let map = picksByUser.get(p.user_id)
    if (!map) { map = new Map(); picksByUser.set(p.user_id, map) }
    map.set(p.match_id, p.pick)
  }

  const rows = stAllUsers.all().map((u) => {
    const mine = picksByUser.get(u.id)
    let vnd = 0, correct = 0, wrong = 0, missed = 0
    for (const m of finished) {
      const pick = (mine && mine.get(m.id)) ?? null
      if (pick == null) {
        missed += 1
        vnd -= FINE_MISS
      } else if (pick === result(m.score1, m.score2)) {
        correct += 1
      } else {
        wrong += 1
        vnd -= FINE_WRONG
      }
    }
    return { name: u.name, vnd, correct, wrong, missed, finished: finished.length, created_at: u.created_at }
  })

  return rows
    .sort(
      (a, b) =>
        a.vnd - b.vnd ||
        a.correct - b.correct ||
        a.created_at - b.created_at
    )
    .map(({ name, vnd, correct, wrong, missed, finished }) => ({
      name, vnd, correct, wrong, missed, finished,
    }))
}

export default db
