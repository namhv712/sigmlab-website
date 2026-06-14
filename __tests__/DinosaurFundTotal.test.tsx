import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import DinosaurFundTotal from '@/components/wc/DinosaurFundTotal'
import { dinoSummary, dinoTallyFromRows } from '@/lib/wcDinos'
import type { LeaderRow } from '@/lib/wcTypes'

const row = (name: string, wrong: number, missed: number): LeaderRow => ({
  name,
  vnd: -(wrong * 30_000 + missed * 100_000),
  correct: 0,
  wrong,
  missed,
  finished: wrong + missed,
})

describe('DinosaurFundTotal', () => {
  it('sums wrong picks as Raptors and missed picks as T-Rexes', () => {
    const tally = dinoTallyFromRows([row('A', 2, 1), row('B', 1, 3)])
    expect(tally.raptors).toBe(3)
    expect(tally.trexes).toBe(4)
    expect(dinoSummary(tally)).toBe('4 T-Rex · 3 Raptor')
  })

  it('rolls every ten same-species dinos into a giant in the summary', () => {
    // 9 missed -> no giant T-Rex (9 < 10); 82 wrong -> 8 giant + 2 Raptor
    const tally = dinoTallyFromRows([row('A', 50, 5), row('B', 32, 4)])
    expect(tally.trexes).toBe(9)
    expect(tally.raptors).toBe(82)
    expect(dinoSummary(tally)).toBe('9 T-Rex · 8 Raptor khổng lồ · 2 Raptor')
  })

  it('renders the dinosaur pack without showing cash', () => {
    render(<DinosaurFundTotal rows={[row('A', 2, 1), row('B', 1, 3)]} />)
    expect(screen.getByText('Tổng đàn')).toBeInTheDocument()
    expect(screen.getByText('4 T-Rex · 3 Raptor')).toBeInTheDocument()
    expect(screen.queryByText(/VND|vnđ|đồng|30\.000|100\.000/i)).not.toBeInTheDocument()
  })

  it('uses the legendary dinosaur state at high contribution', () => {
    render(<DinosaurFundTotal rows={[row('A', 0, 50)]} />)
    expect(screen.getByLabelText('Khủng long huyền thoại')).toBeInTheDocument()
  })
})
