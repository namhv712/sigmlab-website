import type { VenueWithDerived } from '@/lib/venues/types'
import { formatDeadline } from '@/lib/venues/utils'
import { topicLabel } from '@/lib/venues/topics'
import { RankBadge } from './RankBadge'
import { DeadlinePill } from './DeadlinePill'

type Props = { venue: VenueWithDerived }

function MetricRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1 border-b border-gray-100 last:border-0">
      <dt className="text-gray-600">{label}</dt>
      <dd className="font-medium text-gray-900 text-right">{value ?? <span className="text-gray-400">—</span>}</dd>
    </div>
  )
}

export function VenueDetailPanel({ venue }: Props) {
  const r = venue.rankings
  const today = new Date().toISOString().slice(0, 10)
  const upcoming = (venue.deadlines ?? []).filter(d => d.date >= today).sort((a, b) => a.date.localeCompare(b.date))
  const past = (venue.deadlines ?? []).filter(d => d.date < today).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6)

  return (
    <div className="bg-gray-50 px-6 py-5 border-t border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* About */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-2">About</h3>
          <p className="font-semibold text-gray-900">{venue.fullName}</p>
          {venue.aliases && venue.aliases.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">Also: {venue.aliases.join(' · ')}</p>
          )}
          {venue.parent && <p className="text-sm text-gray-700 mt-2">Workshop at: <span className="font-medium uppercase">{venue.parent}</span></p>}
          {venue.publisher && <p className="text-sm text-gray-700 mt-2">Publisher: <span className="font-medium">{venue.publisher}</span></p>}
          {venue.location && <p className="text-sm text-gray-700">Location: <span className="font-medium">{venue.location}</span></p>}
          {venue.frequency && <p className="text-sm text-gray-700 capitalize">Frequency: <span className="font-medium">{venue.frequency}</span></p>}
          {venue.acceptanceRate !== undefined && (
            <p className="text-sm text-gray-700">Acceptance rate: <span className="font-medium">{(venue.acceptanceRate * 100).toFixed(1)}%</span></p>
          )}
          {venue.issn && <p className="text-sm text-gray-700">ISSN: <span className="font-mono text-xs">{venue.issn}</span></p>}
          {venue.eIssn && <p className="text-sm text-gray-700">eISSN: <span className="font-mono text-xs">{venue.eIssn}</span></p>}
          {venue.notes && <p className="text-sm text-gray-700 mt-3 italic">{venue.notes}</p>}
          <a href={venue.website} target="_blank" rel="noopener noreferrer"
             className="inline-block mt-3 text-sm font-semibold text-blue-900 hover:underline">
            Open website ↗
          </a>
          <div className="flex flex-wrap gap-1 mt-3">
            {venue.topics.map(t => (
              <span key={t} className="px-2 py-0.5 rounded-full bg-white border border-gray-200 text-xs text-gray-700">
                {topicLabel(t)}
              </span>
            ))}
          </div>
          {venue.lastVerified && (
            <p className="text-xs text-gray-400 mt-3">Last verified: {venue.lastVerified}</p>
          )}
        </div>

        {/* Rankings */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-2">Rankings & indexing</h3>
          <dl className="text-sm">
            <MetricRow label="Scopus indexed" value={r.scopus === undefined ? null : r.scopus ? 'Yes' : 'No'} />
            <MetricRow label="ISI / WoS" value={r.isi === undefined ? null : r.isi ? 'Yes' : 'No'} />
            <MetricRow label="DBLP" value={r.dblp === undefined ? null : r.dblp ? 'Yes' : 'No'} />
            <MetricRow label="Scimago Quartile" value={r.scimagoQuartile && <RankBadge kind="quartile" value={r.scimagoQuartile} />} />
            <MetricRow label="SJR" value={r.sjr?.toFixed(2)} />
            <MetricRow label="JCR Impact Factor" value={r.jcrImpactFactor?.toFixed(2)} />
            <MetricRow label="JCR Quartile" value={r.jcrQuartile && <RankBadge kind="quartile" value={r.jcrQuartile} />} />
            <MetricRow label="CiteScore" value={r.citeScore?.toFixed(1)} />
            <MetricRow label="h-index" value={r.hIndex} />
            <MetricRow label="CORE" value={r.core && <RankBadge kind="core" value={r.core} />} />
            <MetricRow label="ERA" value={r.era} />
            <MetricRow label="CCF" value={r.ccf && <RankBadge kind="ccf" value={r.ccf} />} />
            <MetricRow label="Qualis" value={r.qualis} />
            <MetricRow label="THCPL" value={r.thcpl} />
          </dl>
        </div>

        {/* Deadlines */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-2">Deadlines</h3>
          {upcoming.length === 0 && past.length === 0 && (
            <p className="text-sm text-gray-500">{venue.frequency === 'rolling' ? 'Rolling submission — no fixed deadline.' : 'No deadlines on file.'}</p>
          )}
          {upcoming.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-1">Upcoming</h4>
              <ul className="text-sm space-y-1">
                {upcoming.map((d, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <DeadlinePill daysUntil={Math.round((new Date(d.date).getTime() - Date.now()) / 86_400_000)} />
                    <span className="capitalize text-gray-700">{d.kind.replace('-', ' ')}</span>
                    <span className="text-gray-500">— {formatDeadline(d.date)}</span>
                    {d.timezone && <span className="text-xs text-gray-400">({d.timezone})</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {past.length > 0 && (
            <div className="mt-3">
              <h4 className="text-xs font-semibold text-gray-700 mb-1">Recent past</h4>
              <ul className="text-xs space-y-1 text-gray-500">
                {past.map((d, i) => (
                  <li key={i}>
                    <span className="capitalize">{d.kind.replace('-', ' ')}</span> — {formatDeadline(d.date)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
