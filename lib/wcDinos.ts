import type { LeaderRow } from './wcTypes'

export type DinoTier = 'hungry' | 'herd' | 'legend'
export type PrestigeTier = 'none' | 'supporter' | 'noble' | 'legend'

// A same-species count rolls up into three visual tiers: lone dinos, "khổng lồ"
// (giant) packs, and "huyền thoại" (legendary, purple) super-packs.
export type DinoPackTier = 'single' | 'giant' | 'legendary'

export interface DinoSummaryPart {
  text: string
  tier: DinoPackTier
}

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

// Ten "khổng lồ" giants (DINO_GROUP_SIZE²) roll up again into one purple
// "huyền thoại" (legendary) dino, e.g. 235 Raptor →
// 2 huyền thoại · 3 khổng lồ · 5 Raptor. Also shared with the runners.
export const DINO_LEGEND_SIZE = DINO_GROUP_SIZE * DINO_GROUP_SIZE

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

// Roll a same-species count up into legendary super-packs of DINO_LEGEND_SIZE,
// giant packs of DINO_GROUP_SIZE, and leftover singles, e.g.
// 235 -> "2 Raptor huyền thoại · 3 Raptor khổng lồ · 5 Raptor"; 9 -> "9 Raptor".
function speciesParts(count: number, name: string): DinoSummaryPart[] {
  if (count <= 0) return []
  const legendary = Math.floor(count / DINO_LEGEND_SIZE)
  const large = Math.floor((count % DINO_LEGEND_SIZE) / DINO_GROUP_SIZE)
  const single = count % DINO_GROUP_SIZE
  const parts: DinoSummaryPart[] = []
  if (legendary > 0) parts.push({ text: `${legendary} ${name} huyền thoại`, tier: 'legendary' })
  if (large > 0) parts.push({ text: `${large} ${name} khổng lồ`, tier: 'giant' })
  if (single > 0) parts.push({ text: `${single} ${name}`, tier: 'single' })
  return parts
}

export function dinoSummaryParts(
  tally: Pick<DinoTally, 'raptors' | 'trexes' | 'total'>,
): DinoSummaryPart[] {
  if (tally.total <= 0) return []
  return [
    ...speciesParts(tally.trexes, 'T-Rex'),
    ...speciesParts(tally.raptors, 'Raptor'),
  ]
}

export function dinoSummary(tally: Pick<DinoTally, 'raptors' | 'trexes' | 'total'>): string {
  if (tally.total <= 0) return 'Chưa có khủng long'
  return dinoSummaryParts(tally)
    .map((part) => part.text)
    .join(' · ')
}

// True once any species has amassed a full legendary super-pack (≥ 100).
export function hasLegendaryPack(tally: Pick<DinoTally, 'raptors' | 'trexes'>): boolean {
  return tally.raptors >= DINO_LEGEND_SIZE || tally.trexes >= DINO_LEGEND_SIZE
}
