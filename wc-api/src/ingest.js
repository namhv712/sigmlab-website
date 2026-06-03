import { kickoffEpoch } from './time.js'
import { upsertMatch } from './db.js'

export const SCHEDULE_URL =
  'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json'

// Derive a normalized stage code from the raw round label.
// Conventions (case-insensitive):
//   contains "final" but not "quarter"/"semi"  → final
//   "semi"                                      → sf
//   "third"                                     → third  (e.g. "Match for third place")
//   "quarter"                                   → qf
//   "round of 16"                               → r16
//   "round of 32"                               → r32
//   otherwise (Matchday N / has group)          → group
export function deriveStage(round, group) {
  const r = (round || '').toLowerCase()
  if (r.includes('third')) return 'third'
  if (r.includes('semi')) return 'sf'
  if (r.includes('quarter')) return 'qf'
  if (r.includes('final')) return 'final'
  if (r.includes('round of 16')) return 'r16'
  if (r.includes('round of 32')) return 'r32'
  if (group) return 'group'
  return 'group'
}

// Extract score1/score2 from a raw openfootball match. Handles BOTH shapes:
//   top-level numeric score1/score2, OR a score object { ft: [a, b] }.
// Returns { score1, score2 } with null when not yet played.
export function extractScore(raw) {
  if (typeof raw.score1 === 'number' && typeof raw.score2 === 'number') {
    return { score1: raw.score1, score2: raw.score2 }
  }
  const ft = raw.score && raw.score.ft
  if (Array.isArray(ft) && ft.length >= 2 && typeof ft[0] === 'number' && typeof ft[1] === 'number') {
    return { score1: ft[0], score2: ft[1] }
  }
  return { score1: null, score2: null }
}

// Map one raw openfootball match (+ its array index) into our match row shape.
export function mapMatch(raw, index) {
  const group = raw.group || null
  const { score1, score2 } = extractScore(raw)
  return {
    id: `of-${index}`,
    stage: deriveStage(raw.round, group),
    round: raw.round || null,
    group,
    kickoff_utc: kickoffEpoch(raw.date, raw.time),
    team1: raw.team1 || null,
    team2: raw.team2 || null,
    ground: raw.ground || null,
    score1,
    score2,
  }
}

// Fetch the openfootball schedule, map all matches, upsert each.
// Tolerates fetch/parse failure: logs and returns 0 rather than throwing.
export async function ingest(db) {
  try {
    const res = await fetch(SCHEDULE_URL)
    if (!res.ok) {
      console.error(`[ingest] fetch failed: HTTP ${res.status}`)
      return 0
    }
    const data = await res.json()
    const matches = Array.isArray(data) ? data : data.matches || []
    let n = 0
    matches.forEach((raw, i) => {
      try {
        upsertMatch(mapMatch(raw, i))
        n++
      } catch (e) {
        console.error(`[ingest] skip match ${i}: ${e.message}`)
      }
    })
    console.log(`[ingest] upserted ${n} matches`)
    return n
  } catch (e) {
    console.error(`[ingest] error: ${e.message}`)
    return 0
  }
}
