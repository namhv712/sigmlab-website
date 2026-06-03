import { DatabaseSync } from 'node:sqlite'
import { pointsFor } from './scoring.js'

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
    created_at INTEGER
  );
  CREATE TABLE IF NOT EXISTS picks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    match_id TEXT,
    pick TEXT,
    updated_at INTEGER,
    UNIQUE(user_id, match_id)
  );
`)

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

const stGetUserByName = db.prepare(`SELECT id, name, created_at FROM users WHERE name=?`)
export const getUserByName = (name) => stGetUserByName.get(name)

const stCreateUser = db.prepare(`INSERT INTO users (name, created_at) VALUES (?, ?)`)
export function createUser(name) {
  const res = stCreateUser.run(name, now())
  return { id: Number(res.lastInsertRowid), name, created_at: now() }
}

export function getOrCreateUser(name) {
  return getUserByName(name) || createUser(name)
}

const stMatchExists = db.prepare(`SELECT 1 FROM matches WHERE id=?`)
export const matchExists = (id) => !!stMatchExists.get(id)

const stUpsertPick = db.prepare(`
  INSERT INTO picks (user_id, match_id, pick, updated_at)
  VALUES (?, ?, ?, ?)
  ON CONFLICT(user_id, match_id) DO UPDATE SET pick=excluded.pick, updated_at=excluded.updated_at
`)
export function upsertPick(userId, matchId, pick) {
  stUpsertPick.run(userId, matchId, pick, now())
}

const stUserPicks = db.prepare(`SELECT match_id, pick FROM picks WHERE user_id=?`)
export function userPicks(userId) {
  const rows = stUserPicks.all(userId)
  const out = {}
  for (const r of rows) out[r.match_id] = r.pick
  return out
}

// Leaderboard: join picks to matches that have BOTH scores, +3 per correct.
// Order: points desc, correct desc, created_at asc.
const stLeaderRows = db.prepare(`
  SELECT u.id AS user_id, u.name AS name, u.created_at AS created_at,
         p.pick AS pick, m.score1 AS score1, m.score2 AS score2
  FROM users u
  JOIN picks p ON p.user_id = u.id
  JOIN matches m ON m.id = p.match_id
  WHERE m.score1 IS NOT NULL AND m.score2 IS NOT NULL
`)
const stAllUsers = db.prepare(`SELECT id, name, created_at FROM users`)

export function leaderboard() {
  const agg = new Map()
  for (const u of stAllUsers.all()) {
    agg.set(u.id, { name: u.name, points: 0, correct: 0, played: 0, created_at: u.created_at })
  }
  for (const r of stLeaderRows.all()) {
    const row = agg.get(r.user_id)
    if (!row) continue
    row.played += 1
    const pts = pointsFor(r.pick, r.score1, r.score2)
    if (pts > 0) {
      row.points += pts
      row.correct += 1
    }
  }
  return [...agg.values()]
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.correct - a.correct ||
        a.created_at - b.created_at
    )
    .map(({ name, points, correct, played }) => ({ name, points, correct, played }))
}

export default db
