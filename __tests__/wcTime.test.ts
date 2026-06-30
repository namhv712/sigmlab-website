import { describe, it, expect } from 'vitest'
import { matchLabel, countdown, matchDayKey } from '@/lib/wcTime'

const WEEKDAYS = ['CN', 'Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7']
const pad = (n: number) => String(n).padStart(2, '0')

describe('matchLabel', () => {
  it('formats kickoffs in the local browser timezone', () => {
    const e = Date.UTC(2026, 5, 11, 19, 0, 0) / 1000
    const d = new Date(e * 1000)
    const l = matchLabel(e)

    expect(l.time).toBe(`${pad(d.getHours())}:${pad(d.getMinutes())}`)
    expect(l.date).toBe(`${pad(d.getDate())}/${pad(d.getMonth() + 1)}`)
    expect(l.weekday).toBe(WEEKDAYS[d.getDay()])
  })

  it('groups by local browser day key', () => {
    const e = Date.UTC(2026, 5, 11, 19, 0, 0) / 1000
    const d = new Date(e * 1000)

    expect(matchDayKey(e)).toBe(
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    )
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
