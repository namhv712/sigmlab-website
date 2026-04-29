'use client'

import { useMemo, useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import type { VenueWithDerived } from '@/lib/venues/types'
import { UpcomingDeadlines } from '@/components/venues/UpcomingDeadlines'
import { VenuesFilters, type FilterState } from '@/components/venues/VenuesFilters'
import { VenuesTable, type SortColumn, type SortDir } from '@/components/venues/VenuesTable'

type Tab = 'all' | 'conferences' | 'journals' | 'workshops'

const TAB_TO_TYPE: Record<Tab, string | null> = {
  all: null,
  conferences: 'conference',
  journals: 'journal',
  workshops: 'workshop',
}

export default function VenuesClient({ venues, generatedAt }: { venues: VenueWithDerived[]; generatedAt?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Initialize from URL
  const [tab, setTab] = useState<Tab>(() => (searchParams.get('tab') as Tab) || 'all')
  const [filters, setFilters] = useState<FilterState>(() => readFiltersFromParams(searchParams))
  const [sort, setSort] = useState<{ column: SortColumn; dir: SortDir }>(() => ({
    column: (searchParams.get('sort') as SortColumn) || 'nextDeadline',
    dir: (searchParams.get('dir') as SortDir) || 'asc',
  }))
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  // Sync to URL
  useEffect(() => {
    const params = writeFiltersToParams(filters, tab, sort)
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, tab, sort])

  const filtered = useMemo(() => filterAndSort(venues, tab, filters, sort), [venues, tab, filters, sort])

  const onJumpTo = useCallback((id: string) => {
    setExpanded(prev => new Set(prev).add(id))
    setTimeout(() => {
      const el = document.getElementById(`venue-${id}`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 50)
  }, [])

  const handleSort = useCallback((column: SortColumn) => {
    setSort(prev => ({
      column,
      dir: prev.column === column && prev.dir === 'asc' ? 'desc' : 'asc',
    }))
  }, [])

  const toggleExpanded = useCallback((id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  return (
    <div className="page-container">
      <h1 className="page-title">Computer Vision Venues</h1>
      <p className="text-gray-600 max-w-3xl mb-2">
        A curated reference of CV/ML publication venues with rankings, indexing, and submission deadlines.
      </p>
      <p className="text-xs text-gray-500 mb-6">
        {venues.length} venues{generatedAt && ` · last updated ${generatedAt}`}
      </p>

      <UpcomingDeadlines venues={venues} onSelect={onJumpTo} />

      <nav aria-label="Venue type" className="flex gap-1 mb-4 border-b border-gray-200">
        {(['all', 'conferences', 'journals', 'workshops'] as Tab[]).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-semibold capitalize border-b-2 -mb-px transition-colors ${
              tab === t ? 'border-blue-900 text-blue-900' : 'border-transparent text-gray-600 hover:text-blue-900'
            }`}
          >
            {t}
          </button>
        ))}
      </nav>

      <VenuesFilters state={filters} onChange={setFilters} venues={venues} />

      <VenuesTable
        venues={filtered}
        sort={sort}
        onSort={handleSort}
        expanded={expanded}
        onToggle={toggleExpanded}
      />
    </div>
  )
}

function filterAndSort(
  all: VenueWithDerived[],
  tab: Tab,
  f: FilterState,
  sort: { column: SortColumn; dir: SortDir },
): VenueWithDerived[] {
  const tabType = TAB_TO_TYPE[tab]
  const q = f.search.trim().toLowerCase()
  const today = new Date().toISOString().slice(0, 10)
  const yearStart = today.slice(0, 4) + '-01-01'
  const yearEnd = today.slice(0, 4) + '-12-31'

  const result = all.filter(v => {
    if (tabType && v.type !== tabType) return false
    if (f.types.size && !f.types.has(v.type)) return false
    if (q) {
      const haystack = [v.name, v.fullName, ...(v.aliases ?? [])].join(' ').toLowerCase()
      if (!haystack.includes(q)) return false
    }
    if (f.topics.size && ![...f.topics].every(t => v.topics.includes(t))) return false
    if (f.indexing.has('scopus') && !v.rankings.scopus) return false
    if (f.indexing.has('isi') && !v.rankings.isi) return false
    if (f.indexing.has('dblp') && !v.rankings.dblp) return false
    if (f.quartiles.size && !(v.rankings.scimagoQuartile && f.quartiles.has(v.rankings.scimagoQuartile))) return false
    if (f.cores.size && !(v.rankings.core && f.cores.has(v.rankings.core))) return false
    if (f.ccfs.size && !(v.rankings.ccf && f.ccfs.has(v.rankings.ccf))) return false
    if (f.publishers.size && !(v.publisher && f.publishers.has(v.publisher))) return false
    if (f.deadlineWindow !== 'all') {
      const d = v.daysUntilNext
      if (f.deadlineWindow === 'open' && (d === undefined || d < 0)) return false
      if (f.deadlineWindow === '30d' && (d === undefined || d < 0 || d > 30)) return false
      if (f.deadlineWindow === '90d' && (d === undefined || d < 0 || d > 90)) return false
      if (f.deadlineWindow === 'past' && (d === undefined || d >= 0)) return false
      if (f.deadlineWindow === 'this-year') {
        if (!v.nextDeadlineDate || v.nextDeadlineDate < yearStart || v.nextDeadlineDate > yearEnd) return false
      }
    }
    return true
  })

  return result.sort((a, b) => compare(a, b, sort.column, sort.dir))
}

const QUARTILE_RANK: Record<string, number> = { Q1: 1, Q2: 2, Q3: 3, Q4: 4 }
const CORE_RANK: Record<string, number> = { 'A*': 1, A: 2, B: 3, C: 4, unranked: 5 }

function compare(a: VenueWithDerived, b: VenueWithDerived, col: SortColumn, dir: SortDir): number {
  const sign = dir === 'asc' ? 1 : -1
  const num = (n?: number) => (n === undefined || Number.isNaN(n) ? Number.POSITIVE_INFINITY : n)
  switch (col) {
    case 'name': return sign * a.name.localeCompare(b.name)
    case 'type': return sign * a.type.localeCompare(b.type)
    case 'core':
      return sign * ((CORE_RANK[a.rankings.core ?? 'unranked'] ?? 5) - (CORE_RANK[b.rankings.core ?? 'unranked'] ?? 5))
    case 'quartile':
      return sign * ((QUARTILE_RANK[a.rankings.scimagoQuartile ?? ''] ?? 5) - (QUARTILE_RANK[b.rankings.scimagoQuartile ?? ''] ?? 5))
    case 'jcrIf': return sign * (num(b.rankings.jcrImpactFactor) - num(a.rankings.jcrImpactFactor)) * -1 // higher first when asc=desc effectively
    case 'sjr': return sign * (num(a.rankings.sjr) - num(b.rankings.sjr))
    case 'hIndex': return sign * (num(a.rankings.hIndex) - num(b.rankings.hIndex))
    case 'nextDeadline':
    case 'daysUntil':
      return sign * ((a.daysUntilNext ?? Number.POSITIVE_INFINITY) - (b.daysUntilNext ?? Number.POSITIVE_INFINITY))
    case 'acceptanceRate': return sign * (num(a.acceptanceRate) - num(b.acceptanceRate))
  }
}

function readFiltersFromParams(p: URLSearchParams): FilterState {
  return {
    search: p.get('q') ?? '',
    types: new Set((p.get('type') ?? '').split(',').filter(Boolean)),
    topics: new Set((p.get('topics') ?? '').split(',').filter(Boolean)),
    indexing: new Set((p.get('idx') ?? '').split(',').filter(Boolean)),
    quartiles: new Set((p.get('quartile') ?? '').split(',').filter(Boolean)),
    cores: new Set((p.get('core') ?? '').split(',').filter(Boolean)),
    ccfs: new Set((p.get('ccf') ?? '').split(',').filter(Boolean)),
    publishers: new Set((p.get('pub') ?? '').split(',').filter(Boolean)),
    deadlineWindow: (p.get('window') as FilterState['deadlineWindow']) ?? 'all',
  }
}

function writeFiltersToParams(
  f: FilterState, tab: Tab, sort: { column: SortColumn; dir: SortDir },
): URLSearchParams {
  const p = new URLSearchParams()
  if (tab !== 'all') p.set('tab', tab)
  if (f.search) p.set('q', f.search)
  if (f.types.size) p.set('type', [...f.types].join(','))
  if (f.topics.size) p.set('topics', [...f.topics].join(','))
  if (f.indexing.size) p.set('idx', [...f.indexing].join(','))
  if (f.quartiles.size) p.set('quartile', [...f.quartiles].join(','))
  if (f.cores.size) p.set('core', [...f.cores].join(','))
  if (f.ccfs.size) p.set('ccf', [...f.ccfs].join(','))
  if (f.publishers.size) p.set('pub', [...f.publishers].join(','))
  if (f.deadlineWindow !== 'all') p.set('window', f.deadlineWindow)
  if (sort.column !== 'nextDeadline') p.set('sort', sort.column)
  if (sort.dir !== 'asc') p.set('dir', sort.dir)
  return p
}
