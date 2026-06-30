// Penalty-only money model (must mirror wc-api/src/scoring.js).
// Correct guess costs nothing; a wrong guess is fined, skipping a finished
// match (no pick) is fined more. Totals are always ≤ 0 — money you owe.

import type { Match, Pick } from './wcTypes'
import { result, resultForMatch } from './wcResult'

export const FINE_WRONG = 30_000 // đoán sai
export const FINE_MISS = 100_000 // không chọn (bỏ trống)

export interface Tally {
  vnd: number // net total (≤ 0)
  correct: number
  wrong: number
  missed: number
  finished: number // finished matches counted
}

// VND delta for one finished match. correct 0 / wrong -30k / not selected -100k.
export function matchMoney(
  pick: Pick | null | undefined,
  score1: number | null,
  score2: number | null,
): number {
  if (score1 == null || score2 == null) return 0
  if (pick == null) return -FINE_MISS
  return pick === result(score1, score2) ? 0 : -FINE_WRONG
}

// Tally a member's finished matches straight from the schedule (uses myPick).
export function tally(matches: Match[]): Tally {
  let vnd = 0
  let correct = 0
  let wrong = 0
  let missed = 0
  let finished = 0
  for (const m of matches) {
    if (m.status !== 'finished' || m.score1 == null || m.score2 == null) continue
    const outcome = resultForMatch(m)
    if (!outcome) continue
    finished += 1
    const pick = m.myPick ?? null
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
  return { vnd, correct, wrong, missed, finished }
}
