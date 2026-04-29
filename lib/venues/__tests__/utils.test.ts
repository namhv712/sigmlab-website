import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  daysUntil, getNextDeadline, formatDeadline, urgencyTier, enrichVenue,
} from '../utils'
import type { Venue } from '../types'

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-05-01T00:00:00Z'))
})
afterEach(() => { vi.useRealTimers() })

describe('daysUntil', () => {
  it('returns 0 for today', () => {
    expect(daysUntil('2026-05-01')).toBe(0)
  })
  it('returns positive for future', () => {
    expect(daysUntil('2026-05-15')).toBe(14)
  })
  it('returns negative for past', () => {
    expect(daysUntil('2026-04-25')).toBe(-6)
  })
})

describe('getNextDeadline', () => {
  const baseVenue = (deadlines: Venue['deadlines']): Venue => ({
    id: 'x', name: 'X', fullName: 'X', type: 'conference',
    topics: ['t'], website: 'https://x', rankings: {}, frequency: 'annual',
    deadlines,
  })

  it('returns soonest future deadline', () => {
    const v = baseVenue([
      { year: 2026, kind: 'full-paper', date: '2026-08-01' },
      { year: 2026, kind: 'notification', date: '2026-06-01' },
      { year: 2025, kind: 'full-paper', date: '2025-11-14' },
    ])
    expect(getNextDeadline(v)?.date).toBe('2026-06-01')
  })

  it('returns undefined if all deadlines past', () => {
    const v = baseVenue([{ year: 2025, kind: 'full-paper', date: '2025-11-14' }])
    expect(getNextDeadline(v)).toBeUndefined()
  })

  it('returns undefined if no deadlines', () => {
    const v = baseVenue(undefined)
    expect(getNextDeadline(v)).toBeUndefined()
  })

  it('treats today as "future"', () => {
    const v = baseVenue([{ year: 2026, kind: 'full-paper', date: '2026-05-01' }])
    expect(getNextDeadline(v)?.date).toBe('2026-05-01')
  })
})

describe('urgencyTier', () => {
  it('classifies correctly', () => {
    expect(urgencyTier(-1)).toBe('past')
    expect(urgencyTier(0)).toBe('critical')
    expect(urgencyTier(7)).toBe('critical')
    expect(urgencyTier(8)).toBe('soon')
    expect(urgencyTier(30)).toBe('soon')
    expect(urgencyTier(31)).toBe('upcoming')
    expect(urgencyTier(90)).toBe('upcoming')
    expect(urgencyTier(91)).toBe('far')
  })
})

describe('enrichVenue', () => {
  it('attaches nextDeadline + nextDeadlineDate + daysUntilNext', () => {
    const v: Venue = {
      id: 'x', name: 'X', fullName: 'X', type: 'conference',
      topics: ['t'], website: 'https://x', rankings: {}, frequency: 'annual',
      deadlines: [{ year: 2026, kind: 'full-paper', date: '2026-05-15' }],
    }
    const enriched = enrichVenue(v)
    expect(enriched.nextDeadline?.date).toBe('2026-05-15')
    expect(enriched.nextDeadlineDate).toBe('2026-05-15')
    expect(enriched.daysUntilNext).toBe(14)
  })
})

describe('formatDeadline', () => {
  it('formats ISO date as readable string', () => {
    expect(formatDeadline('2026-11-14')).toBe('Nov 14, 2026')
  })
})
