// Time helpers for the World Cup tab. Match kickoffs are stored as epoch
// seconds, then formatted/grouped with the selected IANA timezone.

export const FALLBACK_TIME_ZONE = 'UTC'

const WEEKDAY_LABELS: Record<string, string> = {
  Sun: 'CN',
  Mon: 'Th 2',
  Tue: 'Th 3',
  Wed: 'Th 4',
  Thu: 'Th 5',
  Fri: 'Th 6',
  Sat: 'Th 7',
}

const PINNED_TIME_ZONES = [
  'UTC',
  'Asia/Ho_Chi_Minh',
  'Asia/Bangkok',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
  'Europe/London',
  'Europe/Paris',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'America/Mexico_City',
]

type TimeZoneIntl = typeof Intl & {
  supportedValuesOf?: (key: 'timeZone') => string[]
}

export interface MatchTimeLabel {
  time: string // '02:00'
  date: string // '12/06'
  weekday: string // 'Th 6'
}

export function detectBrowserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || FALLBACK_TIME_ZONE
  } catch {
    return FALLBACK_TIME_ZONE
  }
}

export function isValidTimeZone(timeZone: string | null | undefined): timeZone is string {
  if (!timeZone) return false
  try {
    new Intl.DateTimeFormat('en-US', { timeZone }).format(new Date(0))
    return true
  } catch {
    return false
  }
}

export function supportedTimeZones(): string[] {
  const intl = Intl as TimeZoneIntl
  const supported =
    typeof intl.supportedValuesOf === 'function' ? intl.supportedValuesOf('timeZone') : []
  const zones = new Set<string>([...PINNED_TIME_ZONES, ...supported])
  return Array.from(zones).filter(isValidTimeZone)
}

function safeTimeZone(timeZone?: string): string {
  return isValidTimeZone(timeZone) ? timeZone : detectBrowserTimeZone()
}

function partsFor(epochSec: number, timeZone?: string): Record<string, string> {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: safeTimeZone(timeZone),
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  })
  const entries = formatter.formatToParts(new Date(epochSec * 1000))
  return Object.fromEntries(entries.map((part) => [part.type, part.value]))
}

export function matchLabel(epochSec: number, timeZone?: string): MatchTimeLabel {
  const parts = partsFor(epochSec, timeZone)
  const weekday = WEEKDAY_LABELS[parts.weekday] ?? parts.weekday
  return {
    time: `${parts.hour}:${parts.minute}`,
    date: `${parts.day}/${parts.month}`,
    weekday,
  }
}

// Stable YYYY-MM-DD key in the selected timezone, used to group visible match days.
export function matchDayKey(epochSec: number, timeZone?: string): string {
  const parts = partsFor(epochSec, timeZone)
  return `${parts.year}-${parts.month}-${parts.day}`
}

// '2h 10m' / '5m' / 'Đang diễn ra' when target has passed.
export function countdown(targetSec: number, nowSec: number): string {
  const diff = targetSec - nowSec
  if (diff <= 0) return 'Đang diễn ra'
  const totalMin = Math.floor(diff / 60)
  const days = Math.floor(totalMin / 1440)
  const hours = Math.floor((totalMin % 1440) / 60)
  const mins = totalMin % 60
  if (days > 0) return `${days}n ${hours}h`
  if (hours > 0) return `${hours}h ${mins}m`
  return `${mins}m`
}
