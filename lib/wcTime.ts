// Pure GMT+7 (fixed +7h, no DST) time helpers for the World Cup tab.
// We shift the epoch by +7h and then read it with UTC getters, so the output
// is deterministic regardless of the machine's local timezone.

const OFFSET_SEC = 7 * 3600

// Index by the UTC+7 day-of-week (0 = Sunday).
const WEEKDAYS = ['CN', 'Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7']

const pad = (n: number) => String(n).padStart(2, '0')

export interface VnLabel {
  time: string // '02:00'
  date: string // '12/06'
  weekday: string // 'Th 6'
}

export function vnLabel(epochSec: number): VnLabel {
  const d = new Date((epochSec + OFFSET_SEC) * 1000)
  return {
    time: `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`,
    date: `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}`,
    weekday: WEEKDAYS[d.getUTCDay()],
  }
}

// Stable YYYY-MM-DD key in GMT+7 — used to group matches by Vietnam day.
export function vnDayKey(epochSec: number): string {
  const d = new Date((epochSec + OFFSET_SEC) * 1000)
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`
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
