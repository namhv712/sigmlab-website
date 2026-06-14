// Live results updater. openfootball (ingest.js) gives us the FIXTURES but never
// timely SCORES, so final scores come from the worldcup26.ir feed — a single
// JSON endpoint that exposes the full 104-match schedule with a `finished` flag
// and final scores, free and without an API key. (We previously used
// TheSportsDB, whose free key only surfaced ~5 matches; see results.js.tsdb.bak.)
// Team names align with our openfootball/DB names except three, folded by
// NAME_ALIASES below. Only FINISHED matches are applied, so a live partial score
// never prematurely settles a bet.

import { allMatches, setScore } from './db.js'

// Feed shape: { games: [{ home_team_name_en, away_team_name_en, home_score,
// away_score, finished: "TRUE"|"FALSE", matchday, group, ... }] }.
export const RESULTS_URL = process.env.WC_RESULTS_URL || 'https://worldcup26.ir/get/games'

// Kept for backward-compat and the unit tests that import it. The live feed uses
// a boolean-ish `finished` field instead (isFinishedGame), but exposing the old
// terminal-status predicate keeps results.test.js green.
const FINISHED = new Set(['FT', 'AET', 'AP', 'PEN', 'Match Finished', 'Finished'])
export const isFinished = (s) => FINISHED.has(String(s || '').trim())
const isFinishedGame = (g) => String(g && g.finished).trim().toUpperCase() === 'TRUE'

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

// The ONLY three upstream spellings (verified against all 48 teams) that don't
// already normalize-match our openfootball/DB names. Map each to the DB spelling
// so pairKey lookup and home/away orientation matching work unchanged.
//   "United States" -> "USA"
//   "Bosnia and Herzegovina" -> "Bosnia & Herzegovina"
//   "Democratic Republic of the Congo" -> "DR Congo"
const NAME_ALIASES = {
  'united states': 'USA',
  'bosnia and herzegovina': 'Bosnia & Herzegovina',
  'democratic republic of the congo': 'DR Congo',
}
const canon = (n) => NAME_ALIASES[normTeam(n)] || n

const parseScore = (v) => {
  if (v == null || v === '') return null
  const n = Number(v)
  return Number.isInteger(n) && n >= 0 ? n : null
}

// Fetch finished results from the live feed.
// Returns [{ home, away, hs, as }] for FINISHED matches with valid integer
// scores, with team names canonicalized to our DB spelling.
export async function fetchResults(fetchImpl = fetch) {
  const out = []
  let j
  try {
    const res = await fetchImpl(RESULTS_URL, { signal: AbortSignal.timeout(30000) })
    if (!res.ok) return out
    j = await res.json()
  } catch {
    return out // tolerate a flaky fetch; the next cron tick retries
  }
  for (const g of (j && j.games) || []) {
    if (!isFinishedGame(g)) continue
    const hs = parseScore(g.home_score)
    const as = parseScore(g.away_score)
    if (hs == null || as == null) continue
    out.push({ home: canon(g.home_team_name_en), away: canon(g.away_team_name_en), hs, as })
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
