// 1X2 result from a pair of scores.
export const result = (a, b) => (a > b ? '1' : a < b ? '2' : 'X')

// New rule starts at 2026-06-30 00:00 Vietnam time (GMT+7). Matches before
// this keep the old 1X2 interpretation so historical results do not change.
export const TWO_CHOICE_RULE_START = 1782752400

export const isTwoChoiceMatch = (m) => Number(m?.kickoff_utc ?? 0) >= TWO_CHOICE_RULE_START

// Result for a stored match row. Old-rule tied matches resolve to X. New-rule
// tied matches require penalty scores, because the UI no longer offers Draw.
export function resultForMatch(m) {
  if (!m || m.score1 == null || m.score2 == null) return null
  if (m.score1 !== m.score2) return result(m.score1, m.score2)
  if (!isTwoChoiceMatch(m)) return 'X'
  if (m.penalty1 == null || m.penalty2 == null || m.penalty1 === m.penalty2) return null
  return m.penalty1 > m.penalty2 ? '1' : '2'
}

// Penalty-only money model (VND). A correct guess costs nothing; a wrong guess
// is fined, and skipping a finished match (no pick at all) is fined more.
export const FINE_WRONG = 30000 // đoán sai
export const FINE_MISS = 100000 // không chọn (bỏ trống)

// VND delta for one FINISHED match given a pick ('1'|'X'|'2' or null = không chọn).
// correct → 0, wrong → -FINE_WRONG, not selected → -FINE_MISS.
// Null-safe: returns 0 while the match has no final score yet.
export const moneyFor = (pick, a, b) => {
  if (a == null || b == null) return 0
  if (pick == null) return -FINE_MISS
  return pick === result(a, b) ? 0 : -FINE_WRONG
}
