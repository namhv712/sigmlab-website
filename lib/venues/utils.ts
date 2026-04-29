import type { Venue, VenueWithDerived, Deadline } from './types'

export function daysUntil(isoDate: string): number {
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  const target = new Date(isoDate)
  target.setUTCHours(0, 0, 0, 0)
  const ms = target.getTime() - today.getTime()
  return Math.round(ms / 86_400_000)
}

export function getNextDeadline(v: Venue): Deadline | undefined {
  if (!v.deadlines || v.deadlines.length === 0) return undefined
  const future = v.deadlines
    .filter(d => daysUntil(d.date) >= 0)
    .sort((a, b) => a.date.localeCompare(b.date))
  return future[0]
}

export type UrgencyTier = 'past' | 'critical' | 'soon' | 'upcoming' | 'far'

export function urgencyTier(days: number): UrgencyTier {
  if (days < 0) return 'past'
  if (days <= 7) return 'critical'
  if (days <= 30) return 'soon'
  if (days <= 90) return 'upcoming'
  return 'far'
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function formatDeadline(isoDate: string): string {
  const d = new Date(isoDate)
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`
}

export function enrichVenue(v: Venue): VenueWithDerived {
  const nextDeadline = getNextDeadline(v)
  return {
    ...v,
    nextDeadline,
    nextDeadlineDate: nextDeadline?.date,
    daysUntilNext: nextDeadline ? daysUntil(nextDeadline.date) : undefined,
  }
}
