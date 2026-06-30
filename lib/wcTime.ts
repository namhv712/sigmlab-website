// Browser-local time helpers for the World Cup tab. Match kickoffs are stored
// as epoch seconds, then formatted/grouped with the viewer's local timezone.

// Index by local day-of-week (0 = Sunday).
const WEEKDAYS = ['CN', 'Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7']

const pad = (n: number) => String(n).padStart(2, '0')

export interface MatchTimeLabel {
  time: string // '02:00'
  date: string // '12/06'
  weekday: string // 'Th 6'
}

export function matchLabel(epochSec: number): MatchTimeLabel {
  const d = new Date(epochSec * 1000)
  return {
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
    date: `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`,
    weekday: WEEKDAYS[d.getDay()],
  }
}

// Stable YYYY-MM-DD key in the browser timezone, used to group visible match days.
export function matchDayKey(epochSec: number): string {
  const d = new Date(epochSec * 1000)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
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
