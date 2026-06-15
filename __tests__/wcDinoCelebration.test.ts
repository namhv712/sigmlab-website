import { describe, expect, it } from 'vitest'
import { dinoCelebration } from '@/lib/wcDinos'
import type { DinoTally } from '@/lib/wcDinos'

const tally = (raptors: number, trexes: number): DinoTally => ({
  raptors,
  trexes,
  total: raptors + trexes,
  contribution: 0,
})

describe('dinoCelebration', () => {
  it('celebrates the whole herd on first login (no baseline)', () => {
    const cel = dinoCelebration(tally(2, 1), null)
    expect(cel).not.toBeNull()
    expect(cel!.total).toBe(3)
    expect(cel!.delta).toBe(3)
    expect(cel!.parts.map((p) => p.text)).toEqual(['1 T-Rex', '2 Raptor'])
    expect(cel!.legendary).toBe(false)
  })

  it('does not celebrate an empty herd on first login', () => {
    expect(dinoCelebration(tally(0, 0), null)).toBeNull()
  })

  it('celebrates only the growth when the count increased', () => {
    const cel = dinoCelebration(tally(5, 2), 4)
    expect(cel).not.toBeNull()
    expect(cel!.total).toBe(7)
    expect(cel!.delta).toBe(3)
  })

  it('does not celebrate when the count is unchanged', () => {
    expect(dinoCelebration(tally(3, 1), 4)).toBeNull()
  })

  it('does not celebrate when the count somehow shrank', () => {
    expect(dinoCelebration(tally(2, 0), 5)).toBeNull()
  })

  it('flags legendary super-packs', () => {
    const cel = dinoCelebration(tally(100, 0), 99)
    expect(cel).not.toBeNull()
    expect(cel!.legendary).toBe(true)
  })
})
