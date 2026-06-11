// Live results updater. openfootball (ingest.js) gives us the FIXTURES but never
// timely SCORES, so final scores come from TheSportsDB's FIFA World Cup feed
// (league 4429, season 2026). Matches are linked by normalized team-pair (our
// openfootball names align with TheSportsDB except "Bosnia & Herzegovina" vs
// "Bosnia-Herzegovina", which the normalizer folds together). Only FINISHED
// matches are applied, so a live partial score never prematurely settles a bet.

import { allMatches, setScore } from './db.js'

export const TSDB_KEY = process.env.WC_TSDB_KEY || '3' // free public key; override via .env
export const RESULTS_LEAGUE = process.env.WC_TSDB_LEAGUE || '4429'
export const RESULTS_SEASON = process.env.WC_TSDB_SEASON || '2026'
// Group matchdays 1-3 (24 each) + a generous knockout-round probe. Empty rounds
// (knockout not scheduled yet) are simply skipped.
export const RESULTS_ROUNDS = [1, 2, 3, 4, 5, 6, 7, 8]

// TheSportsDB strStatus values that mean the match is over.
const FINISHED = new Set(['FT', 'AET', 'AP', 'PEN', 'Match Finished', 'Finished'])
export const isFinished = (s) => FINISHED.has(String(s || '').trim())

// Fold a team name to a comparable key: lowercase, strip diacritics, collapse
// any non-alphanumeric run to a single space. "Bosnia & Herzegovina" and
// "Bosnia-Herzegovina" -> "bosnia herzegovina"; "Curacao" -> "curacao".
export function normTeam(n) {
  return String(n || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

export const pairKey = (a, b) => {
  const x = normTeam(a)
  const y = normTeam(b)
  return x < y ? `${x}|${y}` : `${y}|${x}`
}

const parseScore = (v) => {
  if (v == null || v === '') return null
  const n = Number(v)
  return Number.isInteger(n) && n >= 0 ? n : null
}

// Fetch finished results across the configured rounds.
// Returns [{ home, away, hs, as }] for FINISHED matches with valid integer scores.
export async function fetchResults(fetchImpl = fetch) {
  const out = []
  for (const r of RESULTS_ROUNDS) {
    let j
    try {
      const res = await fetchImpl(
        `https://www.thesportsdb.com/api/v1/json/${TSDB_KEY}/eventsround.php?id=${RESULTS_LEAGUE}&r=${r}&s=${RESULTS_SEASON}`,
      )
      if (!res.ok) continue
      j = await res.json()
    } catch {
      continue // tolerate a flaky round, keep going
    }
    for (const e of (j && j.events) || []) {
      if (!isFinished(e.strStatus)) continue
      const hs = parseScore(e.intHomeScore)
      const as = parseScore(e.intAwayScore)
      if (hs == null || as == null) continue
      out.push({ home: e.strHomeTeam, away: e.strAwayTeam, hs, as })
    }
  }
  return out
}

// Apply fetched results onto our match rows by team pair (orientation-aware:
// the home score goes to whichever of team1/team2 is the home side).
// `setScoreFn(id, s1, s2)` performs the write and returns truthy on change.
// Returns the number of rows actually updated.
export function applyResults(results, matches, setScoreFn) {
  const byPair = new Map()
  for (const m of matches) byPair.set(pairKey(m.team1, m.team2), m)
  let updated = 0
  for (const r of results) {
    const m = byPair.get(pairKey(r.home, r.away))
    if (!m) continue
    const t1IsHome = normTeam(m.team1) === normTeam(r.home)
    const s1 = t1IsHome ? r.hs : r.as
    const s2 = t1IsHome ? r.as : r.hs
    if (m.score1 === s1 && m.score2 === s2) continue // already up to date
    if (setScoreFn(m.id, s1, s2)) updated += 1
  }
  return updated
}

// Fetch + apply in one go. Safe to call repeatedly (idempotent). Never throws.
export async function updateResults() {
  try {
    const results = await fetchResults()
    const updated = applyResults(results, allMatches(), setScore)
    console.log(`[results] ${results.length} finished upstream, updated ${updated} row(s)`)
    return updated
  } catch (e) {
    console.error(`[results] error: ${e.message}`)
    return 0
  }
}
