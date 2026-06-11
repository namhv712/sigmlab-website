// 1X2 result from a pair of scores.
export const result = (a, b) => (a > b ? '1' : a < b ? '2' : 'X')

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
