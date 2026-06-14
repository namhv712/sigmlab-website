// Shared types for the World Cup 2026 betting tab.

export type Pick = '1' | 'X' | '2'

export type MatchStatus = 'upcoming' | 'live' | 'finished'

// One member's pick on a match. Only revealed by the API for finished matches.
export interface MatchPick {
  name: string
  pick: Pick
}

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
  picks?: MatchPick[] // everyone's picks; present only for finished matches
}

export interface LeaderRow {
  name: string
  vnd: number // net VND, ≤ 0 (penalty-only money model)
  correct: number
  wrong: number
  missed: number // finished matches with no pick ("không chọn")
  finished: number // total finished matches counted (the denominator)
}
