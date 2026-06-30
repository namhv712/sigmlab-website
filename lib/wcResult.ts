import type { Match, Pick as WcPick } from './wcTypes'

// Pure 1X2 result from a final score: '1' team1 win, 'X' draw, '2' team2 win.
export function result(a: number, b: number): WcPick {
  return a > b ? '1' : a < b ? '2' : 'X'
}

// Matches from 2026-06-30 00:00 Vietnam time onward use the new two-choice
// rule. Earlier matches keep the old 1X2 result so historical rows stay stable.
export const TWO_CHOICE_RULE_START = 1782752400

export function resultForMatch(
  match: Pick<Match, 'kickoff' | 'score1' | 'score2' | 'penalty1' | 'penalty2'>,
): WcPick | null {
  if (match.score1 == null || match.score2 == null) return null
  if (match.score1 !== match.score2) return result(match.score1, match.score2)
  if (match.kickoff < TWO_CHOICE_RULE_START) return 'X'
  if (
    match.penalty1 == null ||
    match.penalty2 == null ||
    match.penalty1 === match.penalty2
  ) {
    return null
  }
  return match.penalty1 > match.penalty2 ? '1' : '2'
}
