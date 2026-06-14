import type { LeaderRow } from './wcTypes'

export type DinoTier = 'hungry' | 'herd' | 'legend'
export type PrestigeTier = 'none' | 'supporter' | 'noble' | 'legend'

export interface DinoTally {
  raptors: number
  trexes: number
  total: number
  contribution: number
}

const HERD_THRESHOLD = 1_000_000
const LEGEND_THRESHOLD = 5_000_000

// A full pack of this many same-species dinos rolls up into one "khổng lồ"
// (giant) dino. Shared with the running-dino animation so the text total and
// the runners agree (e.g. 82 Raptor → 8 giant Raptor + 2 Raptor).
export const DINO_GROUP_SIZE = 10

export function contributionOf(row: Pick<LeaderRow, 'vnd'>): number {
  return Math.max(0, -row.vnd)
}

export function dinoTallyFromRows(rows: LeaderRow[]): DinoTally {
  return rows.reduce(
    (acc, row) => {
      acc.raptors += row.wrong
      acc.trexes += row.missed
      acc.total += row.wrong + row.missed
      acc.contribution += contributionOf(row)
      return acc
    },
    { raptors: 0, trexes: 0, total: 0, contribution: 0 },
  )
}

export function dinoTallyFromRow(row: LeaderRow): DinoTally {
  return {
    raptors: row.wrong,
    trexes: row.missed,
    total: row.wrong + row.missed,
    contribution: contributionOf(row),
  }
}

export function dinoTier(contribution: number): DinoTier {
  if (contribution >= LEGEND_THRESHOLD) return 'legend'
  if (contribution >= HERD_THRESHOLD) return 'herd'
  return 'hungry'
}

export function prestigeTier(row: LeaderRow, maxContribution: number): PrestigeTier {
  const contribution = contributionOf(row)
  if (contribution <= 0 || maxContribution <= 0) return 'none'
  const ratio = contribution / maxContribution
  if (ratio >= 0.9) return 'legend'
  if (ratio >= 0.5) return 'noble'
  return 'supporter'
}

export function prestigeTitle(tier: PrestigeTier): string {
  switch (tier) {
    case 'legend':
      return 'Trưởng tộc Kỷ Phấn Trắng'
    case 'noble':
      return 'Quý tộc hóa thạch'
    case 'supporter':
      return 'Người nuôi Raptor'
    default:
      return 'Chưa nuôi khủng long'
  }
}

// Roll a same-species count up into giant packs of DINO_GROUP_SIZE plus the
// leftover singles, e.g. 82 -> "8 Raptor khổng lồ · 2 Raptor"; 9 -> "9 Raptor".
function speciesParts(count: number, name: string): string[] {
  if (count <= 0) return []
  const large = Math.floor(count / DINO_GROUP_SIZE)
  const single = count % DINO_GROUP_SIZE
  const parts: string[] = []
  if (large > 0) parts.push(`${large} ${name} khổng lồ`)
  if (single > 0) parts.push(`${single} ${name}`)
  return parts
}

export function dinoSummary(tally: Pick<DinoTally, 'raptors' | 'trexes' | 'total'>): string {
  if (tally.total <= 0) return 'Chưa có khủng long'
  return [
    ...speciesParts(tally.trexes, 'T-Rex'),
    ...speciesParts(tally.raptors, 'Raptor'),
  ].join(' · ')
}
