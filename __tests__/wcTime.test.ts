import { describe, it, expect } from 'vitest'
import { countdown, isValidTimeZone, matchDayKey, matchLabel, supportedTimeZones } from '@/lib/wcTime'

describe('matchLabel', () => {
  it('formats kickoffs in the selected timezone', () => {
    const e = Date.UTC(2026, 5, 11, 19, 0, 0) / 1000
    const l = matchLabel(e, 'Asia/Ho_Chi_Minh')

    expect(l.time).toBe('02:00')
    expect(l.date).toBe('12/06')
    expect(l.weekday).toBe('Th 6')
  })

  it('groups by selected timezone day key', () => {
    const e = Date.UTC(2026, 5, 11, 19, 0, 0) / 1000

    expect(matchDayKey(e, 'America/New_York')).toBe('2026-06-11')
    expect(matchDayKey(e, 'Asia/Ho_Chi_Minh')).toBe('2026-06-12')
  })

  it('validates and lists selectable IANA timezones', () => {
    expect(isValidTimeZone('Asia/Ho_Chi_Minh')).toBe(true)
    expect(isValidTimeZone('Not/A_Zone')).toBe(false)
    expect(supportedTimeZones()).toContain('Asia/Ho_Chi_Minh')
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
