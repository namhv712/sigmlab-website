// Shared types for the World Cup 2026 betting tab.

export type Pick = '1' | 'X' | '2'

export type MatchStatus = 'upcoming' | 'live' | 'finished'

export interface Match {
  id: string
  stage: string
  group: string | null
  kickoff: number // epoch seconds
  team1: string
  team2: string
  ground: string
  score1: number | null
  score2: number | null
  status: MatchStatus
  myPick?: Pick | null
}

export interface LeaderRow {
  name: string
  points: number
  correct: number
  played: number
}
