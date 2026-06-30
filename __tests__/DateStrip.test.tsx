import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import DateStrip from '@/components/wc/DateStrip'
import { matchDayKey } from '@/lib/wcTime'
import type { Match } from '@/lib/wcTypes'

function match(id: string, kickoff: number): Match {
  return {
    id,
    stage: 'group',
    group: 'A',
    kickoff,
    team1: 'Mexico',
    team2: 'Canada',
    ground: 'Estadio Azteca',
    score1: null,
    score2: null,
    status: 'upcoming',
  }
}

describe('DateStrip', () => {
  let originalScrollIntoView: typeof HTMLButtonElement.prototype.scrollIntoView | undefined

  beforeEach(() => {
    originalScrollIntoView = HTMLButtonElement.prototype.scrollIntoView
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    if (originalScrollIntoView) {
      Object.defineProperty(HTMLButtonElement.prototype, 'scrollIntoView', {
        configurable: true,
        value: originalScrollIntoView,
      })
    } else {
      delete (HTMLButtonElement.prototype as { scrollIntoView?: unknown }).scrollIntoView
    }
  })

  it('labels the browser-local selected day as today and centers that chip', () => {
    const browserNow = new Date(2026, 5, 30, 12, 0, 0)
    vi.useFakeTimers()
    vi.setSystemTime(browserNow)

    const todayKickoff = new Date(2026, 5, 30, 20, 0, 0).getTime() / 1000
    const tomorrowKickoff = new Date(2026, 6, 1, 9, 0, 0).getTime() / 1000
    const selected = matchDayKey(todayKickoff)
    const scrollIntoView = vi.fn()
    Object.defineProperty(HTMLButtonElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    })

    render(
      <DateStrip
        matches={[match('m1', todayKickoff), match('m2', tomorrowKickoff)]}
        selected={selected}
        onSelect={() => undefined}
      />,
    )

    expect(screen.getByText('Hôm nay')).toBeInTheDocument()
    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    })
  })
})
