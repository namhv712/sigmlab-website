import type { VenueWithDerived } from '@/lib/venues/types'
import { formatDeadline } from '@/lib/venues/utils'
import { DeadlinePill } from './DeadlinePill'

type Props = { venues: VenueWithDerived[]; onSelect?: (id: string) => void }

export function UpcomingDeadlines({ venues, onSelect }: Props) {
  const upcoming = venues
    .filter(v => v.daysUntilNext !== undefined && v.daysUntilNext >= 0 && v.daysUntilNext <= 90)
    .sort((a, b) => (a.daysUntilNext ?? 0) - (b.daysUntilNext ?? 0))
    .slice(0, 6)

  if (upcoming.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600">
        No deadlines in the next 90 days.
      </div>
    )
  }

  return (
    <section aria-labelledby="upcoming-deadlines-h" className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 id="upcoming-deadlines-h" className="text-sm font-bold uppercase tracking-wide text-gray-700">
          Upcoming Deadlines (next 90 days)
        </h2>
      </div>
      <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {upcoming.map(v => (
          <li key={v.id}>
            <button
              type="button"
              onClick={() => onSelect?.(v.id)}
              className="w-full text-left bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-400 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-blue-900">{v.name}</span>
                <DeadlinePill daysUntil={v.daysUntilNext} />
              </div>
              <div className="text-xs text-gray-600 capitalize">{v.nextDeadline?.kind.replace('-', ' ')}</div>
              <div className="text-xs text-gray-500">{v.nextDeadline ? formatDeadline(v.nextDeadline.date) : ''}</div>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
