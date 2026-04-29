export type VenueType = 'conference' | 'journal' | 'workshop'
export type Frequency = 'annual' | 'biannual' | 'rolling' | 'irregular'

export type Quartile = 'Q1' | 'Q2' | 'Q3' | 'Q4'
export type CoreRank = 'A*' | 'A' | 'B' | 'C' | 'unranked'
export type CcfRank = 'A' | 'B' | 'C' | 'unranked'
export type EraRank = 'A*' | 'A' | 'B' | 'C' | 'unranked'

export type DeadlineKind =
  | 'abstract'
  | 'full-paper'
  | 'rebuttal'
  | 'notification'
  | 'camera-ready'
  | 'registration'
  | 'rolling'

export interface Deadline {
  year: number
  kind: DeadlineKind
  date: string
  timezone?: string
  note?: string
}

export interface Rankings {
  scopus?: boolean
  isi?: boolean
  dblp?: boolean
  scimagoQuartile?: Quartile
  sjr?: number
  jcrImpactFactor?: number
  jcrQuartile?: Quartile
  citeScore?: number
  hIndex?: number
  core?: CoreRank
  era?: EraRank
  ccf?: CcfRank
  qualis?: string
  thcpl?: string
}

export interface Venue {
  id: string
  name: string
  fullName: string
  aliases?: string[]
  type: VenueType
  topics: string[]
  website: string
  publisher?: string
  issn?: string
  eIssn?: string
  rankings: Rankings
  deadlines?: Deadline[]
  frequency: Frequency
  acceptanceRate?: number
  location?: string
  notes?: string
  lastVerified?: string
}

export interface VenuesDataset {
  $schema?: string
  generatedAt?: string
  venues: Venue[]
}

export interface VenueWithDerived extends Venue {
  nextDeadline?: Deadline
  nextDeadlineDate?: string
  daysUntilNext?: number
}
