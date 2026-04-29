'use client'

import type { VenueWithDerived } from '@/lib/venues/types'
import { formatDeadline } from '@/lib/venues/utils'
import { topicLabel } from '@/lib/venues/topics'
import { RankBadge } from './RankBadge'
import { DeadlinePill } from './DeadlinePill'
import { VenueDetailPanel } from './VenueDetailPanel'

export type SortColumn =
  | 'name' | 'type' | 'core' | 'quartile' | 'jcrIf' | 'sjr' | 'hIndex'
  | 'nextDeadline' | 'daysUntil' | 'acceptanceRate'

export type SortDir = 'asc' | 'desc'

type Props = {
  venues: VenueWithDerived[]
  sort: { column: SortColumn; dir: SortDir }
  onSort: (column: SortColumn) => void
  expanded: Set<string>
  onToggle: (id: string) => void
}

function SortHeader({ label, column, sort, onSort }: {
  label: string; column: SortColumn; sort: Props['sort']; onSort: Props['onSort']
}) {
  const active = sort.column === column
  return (
    <th scope="col" className="px-3 py-2 text-left">
      <button
        type="button"
        onClick={() => onSort(column)}
        aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
        className={`inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide ${active ? 'text-blue-900' : 'text-gray-500 hover:text-gray-900'}`}
      >
        {label}
        {active && <span aria-hidden>{sort.dir === 'asc' ? '▲' : '▼'}</span>}
      </button>
    </th>
  )
}

export function VenuesTable({ venues, sort, onSort, expanded, onToggle }: Props) {
  if (venues.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-500">
        No venues match your filters.
      </div>
    )
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto bg-white border border-gray-200 rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <SortHeader label="Name" column="name" sort={sort} onSort={onSort} />
              <SortHeader label="Type" column="type" sort={sort} onSort={onSort} />
              <th scope="col" className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Topics</th>
              <SortHeader label="CORE" column="core" sort={sort} onSort={onSort} />
              <SortHeader label="Quartile" column="quartile" sort={sort} onSort={onSort} />
              <SortHeader label="JCR IF" column="jcrIf" sort={sort} onSort={onSort} />
              <SortHeader label="Next" column="nextDeadline" sort={sort} onSort={onSort} />
              <SortHeader label="Status" column="daysUntil" sort={sort} onSort={onSort} />
            </tr>
          </thead>
          <tbody>
            {venues.map(v => (
              <RowGroup key={v.id} venue={v} expanded={expanded.has(v.id)} onToggle={() => onToggle(v.id)} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <ul className="md:hidden space-y-2">
        {venues.map(v => (
          <li key={v.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => onToggle(v.id)}
              aria-expanded={expanded.has(v.id)}
              className="w-full text-left px-4 py-3"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-blue-900">{v.name}</span>
                <DeadlinePill daysUntil={v.daysUntilNext} rolling={v.frequency === 'rolling'} />
              </div>
              <div className="flex flex-wrap gap-1 text-xs">
                <RankBadge kind="type" value={v.type} />
                {v.rankings.core && <RankBadge kind="core" value={v.rankings.core} />}
                {v.rankings.scimagoQuartile && <RankBadge kind="quartile" value={v.rankings.scimagoQuartile} />}
              </div>
            </button>
            {expanded.has(v.id) && <VenueDetailPanel venue={v} />}
          </li>
        ))}
      </ul>
    </>
  )
}

function RowGroup({ venue: v, expanded, onToggle }: { venue: VenueWithDerived; expanded: boolean; onToggle: () => void }) {
  return (
    <>
      <tr
        id={`venue-${v.id}`}
        onClick={onToggle}
        className={`border-b border-gray-100 cursor-pointer hover:bg-blue-50/50 ${expanded ? 'bg-blue-50/30' : ''}`}
      >
        <td className="px-3 py-2 font-bold text-blue-900">{v.name}</td>
        <td className="px-3 py-2"><RankBadge kind="type" value={v.type} /></td>
        <td className="px-3 py-2 text-xs text-gray-600">
          {v.topics.slice(0, 2).map(t => topicLabel(t)).join(', ')}
          {v.topics.length > 2 && <span className="text-gray-400"> +{v.topics.length - 2}</span>}
        </td>
        <td className="px-3 py-2"><RankBadge kind="core" value={v.rankings.core} /></td>
        <td className="px-3 py-2"><RankBadge kind="quartile" value={v.rankings.scimagoQuartile} /></td>
        <td className="px-3 py-2 tabular-nums">{v.rankings.jcrImpactFactor?.toFixed(1) ?? <span className="text-gray-400">—</span>}</td>
        <td className="px-3 py-2 text-xs">
          {v.nextDeadline
            ? <span><span className="capitalize text-gray-700">{v.nextDeadline.kind.replace('-', ' ')}</span> · <span className="text-gray-500">{formatDeadline(v.nextDeadline.date)}</span></span>
            : v.frequency === 'rolling' ? <span className="text-gray-500">Rolling</span> : <span className="text-gray-400">—</span>}
        </td>
        <td className="px-3 py-2"><DeadlinePill daysUntil={v.daysUntilNext} rolling={v.frequency === 'rolling'} /></td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={8}><VenueDetailPanel venue={v} /></td>
        </tr>
      )}
    </>
  )
}
