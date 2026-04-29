'use client'

import type { VenueWithDerived } from '@/lib/venues/types'
import { formatDeadline } from '@/lib/venues/utils'
import { topicLabel } from '@/lib/venues/topics'
import { RankBadge } from './RankBadge'
import { DeadlinePill } from './DeadlinePill'
import { VenueDetailPanel } from './VenueDetailPanel'

export type SortColumn =
  | 'name' | 'type' | 'core' | 'ccf' | 'quartile' | 'jcrIf' | 'sjr'
  | 'citeScore' | 'hIndex' | 'nextDeadline' | 'daysUntil' | 'acceptanceRate'

export type SortDir = 'asc' | 'desc'

export type Tab = 'all' | 'conferences' | 'journals' | 'workshops'

type Props = {
  venues: VenueWithDerived[]
  sort: { column: SortColumn; dir: SortDir }
  onSort: (column: SortColumn) => void
  expanded: Set<string>
  onToggle: (id: string) => void
  tab: Tab
}

type ColumnDef = {
  key: string
  label: string
  sortColumn?: SortColumn
  render: (v: VenueWithDerived) => React.ReactNode
  className?: string
}

const COL: Record<string, ColumnDef> = {
  name: {
    key: 'name', label: 'Name', sortColumn: 'name',
    render: v => <span className="font-bold text-blue-900">{v.name}</span>,
  },
  parent: {
    key: 'parent', label: 'Parent',
    render: v => v.parent
      ? <span className="text-xs uppercase font-semibold text-violet-700">{v.parent}</span>
      : <span className="text-gray-300">—</span>,
  },
  type: {
    key: 'type', label: 'Type', sortColumn: 'type',
    render: v => <RankBadge kind="type" value={v.type} />,
  },
  topics: {
    key: 'topics', label: 'Topics',
    className: 'text-xs text-gray-600',
    render: v => (
      <>
        {v.topics.slice(0, 2).map(t => topicLabel(t)).join(', ')}
        {v.topics.length > 2 && <span className="text-gray-400"> +{v.topics.length - 2}</span>}
      </>
    ),
  },
  core: {
    key: 'core', label: 'CORE', sortColumn: 'core',
    render: v => <RankBadge kind="core" value={v.rankings.core} />,
  },
  ccf: {
    key: 'ccf', label: 'CCF', sortColumn: 'ccf',
    render: v => <RankBadge kind="ccf" value={v.rankings.ccf} />,
  },
  acceptance: {
    key: 'acceptance', label: 'Acc%', sortColumn: 'acceptanceRate',
    className: 'tabular-nums text-sm',
    render: v => v.acceptanceRate !== undefined
      ? `${(v.acceptanceRate * 100).toFixed(1)}%`
      : <span className="text-gray-300">—</span>,
  },
  quartile: {
    key: 'quartile', label: 'Quartile', sortColumn: 'quartile',
    render: v => <RankBadge kind="quartile" value={v.rankings.scimagoQuartile} />,
  },
  jcrIf: {
    key: 'jcrIf', label: 'JCR IF', sortColumn: 'jcrIf',
    className: 'tabular-nums text-sm',
    render: v => v.rankings.jcrImpactFactor?.toFixed(1) ?? <span className="text-gray-300">—</span>,
  },
  citeScore: {
    key: 'citeScore', label: 'CiteScore', sortColumn: 'citeScore',
    className: 'tabular-nums text-sm',
    render: v => v.rankings.citeScore?.toFixed(1) ?? <span className="text-gray-300">—</span>,
  },
  hIndex: {
    key: 'hIndex', label: 'h-index', sortColumn: 'hIndex',
    className: 'tabular-nums text-sm',
    render: v => v.rankings.hIndex ?? <span className="text-gray-300">—</span>,
  },
  publisher: {
    key: 'publisher', label: 'Publisher',
    className: 'text-sm text-gray-700',
    render: v => v.publisher ?? <span className="text-gray-300">—</span>,
  },
  next: {
    key: 'next', label: 'Next', sortColumn: 'nextDeadline',
    className: 'text-xs',
    render: v => v.nextDeadline
      ? <span><span className="capitalize text-gray-700">{v.nextDeadline.kind.replace('-', ' ')}</span> · <span className="text-gray-500">{formatDeadline(v.nextDeadline.date)}</span></span>
      : v.frequency === 'rolling'
        ? <span className="text-gray-500">Rolling</span>
        : <span className="text-gray-300">—</span>,
  },
  status: {
    key: 'status', label: 'Status', sortColumn: 'daysUntil',
    render: v => <DeadlinePill daysUntil={v.daysUntilNext} rolling={v.frequency === 'rolling'} />,
  },
}

const COLS_BY_TAB: Record<Tab, ColumnDef[]> = {
  all:         [COL.name, COL.type, COL.topics, COL.core, COL.quartile, COL.next, COL.status],
  conferences: [COL.name, COL.topics, COL.core, COL.ccf, COL.acceptance, COL.next, COL.status],
  journals:    [COL.name, COL.topics, COL.quartile, COL.jcrIf, COL.citeScore, COL.hIndex, COL.publisher],
  workshops:   [COL.name, COL.parent, COL.topics, COL.next, COL.status],
}

function SortHeader({ col, sort, onSort }: {
  col: ColumnDef; sort: Props['sort']; onSort: Props['onSort']
}) {
  if (!col.sortColumn) {
    return (
      <th scope="col" className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-gray-500">{col.label}</th>
    )
  }
  const active = sort.column === col.sortColumn
  return (
    <th
      scope="col"
      className="px-3 py-2 text-left"
      aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <button
        type="button"
        onClick={() => onSort(col.sortColumn!)}
        className={`inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide ${active ? 'text-blue-900' : 'text-gray-500 hover:text-gray-900'}`}
      >
        {col.label}
        {active && <span aria-hidden>{sort.dir === 'asc' ? '▲' : '▼'}</span>}
      </button>
    </th>
  )
}

export function VenuesTable({ venues, sort, onSort, expanded, onToggle, tab }: Props) {
  if (venues.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-500">
        No venues match your filters.
      </div>
    )
  }

  const cols = COLS_BY_TAB[tab]

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto bg-white border border-gray-200 rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {cols.map(c => <SortHeader key={c.key} col={c} sort={sort} onSort={onSort} />)}
            </tr>
          </thead>
          <tbody>
            {venues.map(v => (
              <RowGroup key={v.id} venue={v} cols={cols} expanded={expanded.has(v.id)} onToggle={() => onToggle(v.id)} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <ul className="md:hidden space-y-2">
        {venues.map(v => (
          <li key={v.id} id={`venue-${v.id}`} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => onToggle(v.id)}
              aria-expanded={expanded.has(v.id)}
              className="w-full text-left px-4 py-3"
            >
              <div className="flex items-center justify-between mb-1 gap-2">
                <span className="font-bold text-blue-900 truncate">{v.name}</span>
                <DeadlinePill daysUntil={v.daysUntilNext} rolling={v.frequency === 'rolling'} />
              </div>
              <div className="flex flex-wrap gap-1 text-xs">
                <RankBadge kind="type" value={v.type} />
                {v.parent && <span className="px-2 py-0.5 rounded border bg-violet-50 text-violet-800 border-violet-200 font-semibold uppercase">{v.parent}</span>}
                {v.rankings.core && <RankBadge kind="core" value={v.rankings.core} />}
                {v.rankings.ccf && <RankBadge kind="ccf" value={v.rankings.ccf} />}
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

function RowGroup({ venue: v, cols, expanded, onToggle }: {
  venue: VenueWithDerived; cols: ColumnDef[]; expanded: boolean; onToggle: () => void
}) {
  return (
    <>
      <tr
        id={`venue-${v.id}`}
        onClick={onToggle}
        className={`border-b border-gray-100 cursor-pointer hover:bg-blue-50/50 ${expanded ? 'bg-blue-50/30' : ''}`}
      >
        {cols.map(c => (
          <td key={c.key} className={`px-3 py-2 ${c.className ?? ''}`}>{c.render(v)}</td>
        ))}
      </tr>
      {expanded && (
        <tr>
          <td colSpan={cols.length}><VenueDetailPanel venue={v} /></td>
        </tr>
      )}
    </>
  )
}
