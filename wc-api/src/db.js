import { DatabaseSync } from 'node:sqlite'
import { resultForMatch, FINE_WRONG, FINE_MISS } from './scoring.js'

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
    penalty1 INTEGER,
    penalty2 INTEGER,
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
  CREATE TABLE IF NOT EXISTS follow_restore_picks (
    user_id INTEGER,
    match_id TEXT,
    pick TEXT,
    copied_from INTEGER,
    updated_at INTEGER,
    PRIMARY KEY(user_id, match_id)
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

// Migrate DBs created before penalty shootout support.
const matchCols = db.prepare(`PRAGMA table_info(matches)`).all().map((c) => c.name)
if (!matchCols.includes('penalty1')) db.exec(`ALTER TABLE matches ADD COLUMN penalty1 INTEGER`)
if (!matchCols.includes('penalty2')) db.exec(`ALTER TABLE matches ADD COLUMN penalty2 INTEGER`)

const now = () => Math.floor(Date.now() / 1000)

const stUpsertMatch = db.prepare(`
  INSERT INTO matches (id, stage, round, "group", kickoff_utc, team1, team2, ground, score1, score2, penalty1, penalty2, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    penalty1=COALESCE(excluded.penalty1, matches.penalty1),
    penalty2=COALESCE(excluded.penalty2, matches.penalty2),
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
    m.penalty1 ?? null,
    m.penalty2 ?? null,
    now()
  )
}

const stAllMatches = db.prepare(
  `SELECT id, stage, round, "group" AS "group", kickoff_utc, team1, team2, ground, score1, score2, penalty1, penalty2, updated_at
   FROM matches ORDER BY kickoff_utc ASC, id ASC`
)
export const allMatches = () => stAllMatches.all()

const stSetScore = db.prepare(
  `UPDATE matches SET score1=?, score2=?, penalty1=?, penalty2=?, updated_at=? WHERE id=?`
)
export function setScore(id, s1, s2, p1 = null, p2 = null) {
  const res = stSetScore.run(
    s1 == null ? null : s1,
    s2 == null ? null : s2,
    p1 == null ? null : p1,
    p2 == null ? null : p2,
    now(),
    id,
  )
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

const stDeletePick = db.prepare(`DELETE FROM picks WHERE user_id=? AND match_id=?`)
export function deletePick(userId, matchId) {
  stDeletePick.run(userId, matchId)
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
  `SELECT f.target_id AS targetId, u.name AS targetName, f.created_at AS createdAt
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

// The whole copy graph as name edges (follower copies target), for the public
// "who is copying who" panel. Shown level by level — each direct edge is one
// row; chains are read off as A→B and B→C, never flattened.
const stAllFollows = db.prepare(
  `SELECT fu.name AS follower, tu.name AS target
   FROM follows f
   JOIN users fu ON fu.id = f.follower_id
   JOIN users tu ON tu.id = f.target_id
   ORDER BY tu.name COLLATE NOCASE, fu.name COLLATE NOCASE`
)
export const allFollows = () => stAllFollows.all()

const stDeleteFutureCopiedPicks = db.prepare(`
  DELETE FROM picks
  WHERE copied_from IS NOT NULL
    AND match_id IN (SELECT id FROM matches WHERE kickoff_utc > ?)
`)
const stClearAllFollows = db.prepare(`DELETE FROM follows`)
const stClearAllRestorePicks = db.prepare(`DELETE FROM follow_restore_picks`)

// Copy mode is disabled. Clear active follow relationships and remove only
// still-open copied selections; locked/finished copied rows remain historical.
export function disableCopyMode(nowSec = now()) {
  const deletedCopiedPicks = stDeleteFutureCopiedPicks.run(nowSec).changes
  const deletedFollows = stClearAllFollows.run().changes
  const deletedRestorePicks = stClearAllRestorePicks.run().changes
  return { deletedCopiedPicks, deletedFollows, deletedRestorePicks }
}

const stFollowRows = db.prepare(
  `SELECT follower_id AS followerId, target_id AS targetId, created_at AS createdAt
   FROM follows
   ORDER BY created_at ASC, follower_id ASC`
)

const stPickRow = db.prepare(`SELECT pick, copied_from, updated_at FROM picks WHERE user_id=? AND match_id=?`)
const stMatchKickoff = db.prepare(`SELECT kickoff_utc FROM matches WHERE id=?`)
// Every still-open match (kickoff ahead of `nowSec`) — used to fully re-sync a
// follower against a target (covers both adopting and dropping picks).
const stUpcomingMatchIds = db.prepare(`SELECT id FROM matches WHERE kickoff_utc > ?`)

const stRememberRestorePick = db.prepare(`
  INSERT INTO follow_restore_picks (user_id, match_id, pick, copied_from, updated_at)
  VALUES (?, ?, ?, ?, ?)
  ON CONFLICT(user_id, match_id) DO UPDATE SET
    pick=excluded.pick,
    copied_from=excluded.copied_from,
    updated_at=excluded.updated_at
`)
const stRestorePick = db.prepare(`
  SELECT pick, copied_from FROM follow_restore_picks WHERE user_id=? AND match_id=?
`)
const stClearRestorePicks = db.prepare(`DELETE FROM follow_restore_picks WHERE user_id=?`)

function rememberManualPickForRestore(userId, matchId, row) {
  if (!row || row.copied_from != null) return
  stRememberRestorePick.run(userId, matchId, row.pick, null, row.updated_at ?? now())
}

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

// A followed user can return to "no pick" on an upcoming match when they
// unfollow and had no pre-copy selection to restore. Followers who were only
// copying that row should drop it too; manual overrides stay untouched.
export function propagateDropToFollowers(targetId, matchId, nowSec, seen = new Set()) {
  if (seen.has(targetId)) return
  seen.add(targetId)
  const m = stMatchKickoff.get(matchId)
  if (!m || m.kickoff_utc <= nowSec) return
  for (const fId of followersOf(targetId)) {
    const existing = stPickRow.get(fId, matchId)
    if (!existing || existing.copied_from !== targetId) continue
    deletePick(fId, matchId)
    propagateDropToFollowers(fId, matchId, nowSec, seen)
  }
}

// Make copying LIVE and transitive. When `followerId` (re)follows `targetId`,
// re-materialize the follower's COPIED picks across every still-open match so
// they exactly mirror the target right now: adopt the target's pick (overwriting
// a copy from a previous target), and DROP a stale copied pick the target no
// longer holds. Manual picks (copied_from = null) are never touched.
//
// Then cascade the same re-sync down the follower's own followers, so chains
// re-root end to end: with A→B→C, if B switches to D, A re-roots onto D too.
// `seen` guards against follow cycles (A↔B). Returns how many of the follower's
// own matches changed (the "filled" count surfaced to the API caller).
//
// manualMode:
// - preserve: manual rows are one-match overrides and are never touched.
// - replace:  a fresh "copy X" click resets every still-open match to copy mode.
// - repair:   used on deploy/startup for existing followers; manual rows newer
//             than their follow action are preserved as intentional overrides.
export function resyncFromTarget(
  followerId,
  targetId,
  nowSec,
  seen = new Set(),
  { manualMode = 'preserve', followCreatedAt = null } = {},
) {
  if (seen.has(followerId)) return 0 // cycle guard
  seen.add(followerId)

  let changed = 0
  for (const { id: matchId } of stUpcomingMatchIds.all(nowSec)) {
    const existing = stPickRow.get(followerId, matchId)
    if (existing && existing.copied_from == null) {
      if (manualMode === 'preserve') continue // manual override wins
      if (
        manualMode === 'repair' &&
        followCreatedAt != null &&
        existing.updated_at > followCreatedAt
      ) {
        continue
      }
      rememberManualPickForRestore(followerId, matchId, existing)
    }
    const tp = stPickRow.get(targetId, matchId)
    if (tp) {
      if (!existing || existing.pick !== tp.pick || existing.copied_from !== targetId) {
        upsertPick(followerId, matchId, tp.pick, targetId)
        changed += 1
      }
    } else if (existing) {
      deletePick(followerId, matchId) // target dropped/never held it → stop copying it
      changed += 1
    }
  }

  for (const fId of followersOf(followerId)) {
    resyncFromTarget(fId, followerId, nowSec, seen)
  }
  return changed
}

// Stop following and restore the member's previous visible choices for still
// open matches. Manual picks made while copying are already current rows and
// therefore win; copied rows are replaced with the remembered manual pick, or
// removed if the member had no pick before copy mode.
export function restoreAfterUnfollow(userId, nowSec) {
  let changed = 0
  for (const { id: matchId } of stUpcomingMatchIds.all(nowSec)) {
    const existing = stPickRow.get(userId, matchId)
    if (existing && existing.copied_from == null) continue

    const restore = stRestorePick.get(userId, matchId)
    if (restore) {
      if (
        !existing ||
        existing.pick !== restore.pick ||
        existing.copied_from !== restore.copied_from
      ) {
        upsertPick(userId, matchId, restore.pick, restore.copied_from)
        propagateToFollowers(userId, matchId, restore.pick, nowSec)
        changed += 1
      }
    } else if (existing) {
      deletePick(userId, matchId)
      propagateDropToFollowers(userId, matchId, nowSec)
      changed += 1
    }
  }
  stClearRestorePicks.run(userId)
  return changed
}

// One-shot/current-state repair for users who already had an active follow
// before the "copy all future selections" semantics shipped. It resets old
// pre-follow manual rows into copy mode, while preserving newer manual overrides.
export function resyncAllFollows(nowSec) {
  let changed = 0
  for (const f of stFollowRows.all()) {
    changed += resyncFromTarget(f.followerId, f.targetId, nowSec, new Set(), {
      manualMode: 'repair',
      followCreatedAt: f.createdAt,
    })
  }
  return changed
}

// Leaderboard (penalty-only money model). EVERY finished match counts for
// EVERY user, regardless of when they registered: a user with no pick on a
// finished match is fined FINE_MISS ("không chọn"), a wrong pick FINE_WRONG,
// a correct pick costs nothing. `vnd` is the net total (≤ 0). This is why a
// member who registers late still owes 100k for each already-played match.
// Order: vnd asc (MOST owed on top — it's a penalty "shame board"), then
// fewer-correct, then earlier signup.
const stFinishedMatches = db.prepare(
  `SELECT id, kickoff_utc, score1, score2, penalty1, penalty2
   FROM matches WHERE score1 IS NOT NULL AND score2 IS NOT NULL`
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
    let counted = 0
    for (const m of finished) {
      const outcome = resultForMatch(m)
      if (!outcome) continue
      counted += 1
      const pick = (mine && mine.get(m.id)) ?? null
      if (pick == null) {
        missed += 1
        vnd -= FINE_MISS
      } else if (pick === outcome) {
        correct += 1
      } else {
        wrong += 1
        vnd -= FINE_WRONG
      }
    }
    return { name: u.name, vnd, correct, wrong, missed, finished: counted, created_at: u.created_at }
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
