import type { Pick } from './wcTypes'

// Pure 1X2 result from a final score: '1' team1 win, 'X' draw, '2' team2 win.
export function result(a: number, b: number): Pick {
  return a > b ? '1' : a < b ? '2' : 'X'
}
