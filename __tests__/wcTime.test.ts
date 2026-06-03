import { describe, it, expect } from 'vitest'
import { vnLabel, countdown, vnDayKey } from '@/lib/wcTime'

describe('vnLabel (GMT+7, no DST)', () => {
  it('formats the opener with date + Vietnamese weekday', () => {
    // 2026-06-11 19:00 UTC == 2026-06-12 02:00 GMT+7 (Friday → "Th 6")
    const e = Date.UTC(2026, 5, 11, 19, 0, 0) / 1000
    const l = vnLabel(e)
    expect(l.time).toBe('02:00')
    expect(l.date).toBe('12/06')
    expect(l.weekday).toBe('Th 6')
  })

  it('groups by GMT+7 day key', () => {
    const e = Date.UTC(2026, 5, 11, 19, 0, 0) / 1000
    expect(vnDayKey(e)).toBe('2026-06-12')
  })
})

describe('countdown', () => {
  it('returns a non-empty string for a future target', () => {
    const s = countdown(1000, 0)
    expect(typeof s).toBe('string')
    expect(s.length).toBeGreaterThan(0)
    expect(s).not.toBe('Đang diễn ra')
  })

  it('returns "Đang diễn ra" for a now/past target', () => {
    expect(countdown(100, 100)).toBe('Đang diễn ra')
    expect(countdown(100, 200)).toBe('Đang diễn ra')
  })
})
