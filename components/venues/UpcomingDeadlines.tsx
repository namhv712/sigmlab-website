import type { VenueWithDerived } from '@/lib/venues/types'
import { formatDeadline, urgencyTier } from '@/lib/venues/utils'

type Tab = 'all' | 'conferences' | 'journals' | 'workshops'

type Props = {
  venues: VenueWithDerived[]
  tab: Tab
  onSelect?: (id: string) => void
}

const TIER_BG: Record<string, string> = {
  past: 'bg-slate-100 text-slate-700 border-slate-200',
  critical: 'bg-red-50 text-red-900 border-red-200',
  soon: 'bg-amber-50 text-amber-900 border-amber-200',
  upcoming: 'bg-emerald-50 text-emerald-900 border-emerald-200',
  far: 'bg-blue-50 text-blue-900 border-blue-200',
}

export function UpcomingDeadlines({ venues, tab, onSelect }: Props) {
  const wantedTypes =
    tab === 'workshops' ? ['workshop'] :
    tab === 'conferences' ? ['conference'] :
    ['conference', 'workshop']

  const upcoming = venues
    .filter(v => wantedTypes.includes(v.type))
    .filter(v => v.daysUntilNext !== undefined && v.daysUntilNext >= 0 && v.daysUntilNext <= 90)
    .sort((a, b) => (a.daysUntilNext ?? 0) - (b.daysUntilNext ?? 0))
    .slice(0, 10)

  if (upcoming.length === 0) return null

  return (
    <section aria-labelledby="upcoming-deadlines-h" className="mb-4">
      <div className="flex items-baseline gap-2 mb-2">
        <h2 id="upcoming-deadlines-h" className="text-xs font-bold uppercase tracking-wide text-gray-700">
          Next deadlines
        </h2>
        <span className="text-xs text-gray-500">{upcoming.length} within 90 days</span>
      </div>
      <ul className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scroll-smooth">
        {upcoming.map(v => {
          const tier = urgencyTier(v.daysUntilNext ?? 999)
          const days = v.daysUntilNext ?? 0
          const label = days === 0 ? 'Today' : `${days}d`
          return (
            <li key={v.id} className="shrink-0">
              <button
                type="button"
                onClick={() => onSelect?.(v.id)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm transition-all hover:shadow-sm ${TIER_BG[tier]}`}
                title={v.nextDeadline ? `${v.nextDeadline.kind.replace('-', ' ')} · ${formatDeadline(v.nextDeadline.date)}` : ''}
              >
                <span className="font-bold">{v.name}</span>
                <span className="text-xs opacity-80">{label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
