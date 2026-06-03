// 1X2 result from a pair of scores.
export const result = (a, b) => (a > b ? '1' : a < b ? '2' : 'X')

// +3 if pick matches the result, else 0. Null-safe (no score yet → 0).
export const pointsFor = (pick, a, b) =>
  a == null || b == null || pick == null ? 0 : pick === result(a, b) ? 3 : 0
