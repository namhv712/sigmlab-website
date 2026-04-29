'use client'

import type { VenueWithDerived } from '@/lib/venues/types'
import { topicLabel } from '@/lib/venues/topics'

export interface FilterState {
  search: string
  types: Set<string>
  topics: Set<string>
  indexing: Set<string>
  quartiles: Set<string>
  cores: Set<string>
  ccfs: Set<string>
  publishers: Set<string>
  deadlineWindow: 'all' | 'open' | '30d' | '90d' | 'this-year' | 'past'
}

export const EMPTY_FILTERS: FilterState = {
  search: '',
  types: new Set(),
  topics: new Set(),
  indexing: new Set(),
  quartiles: new Set(),
  cores: new Set(),
  ccfs: new Set(),
  publishers: new Set(),
  deadlineWindow: 'all',
}

type Props = {
  state: FilterState
  onChange: (next: FilterState) => void
  venues: VenueWithDerived[]
}

function toggle<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set)
  if (next.has(value)) next.delete(value)
  else next.add(value)
  return next
}

export function VenuesFilters({ state, onChange, venues }: Props) {
  const allPublishers = Array.from(
    new Set(venues.map(v => v.publisher).filter(Boolean) as string[])
  ).sort()
  const allTopics = Array.from(
    new Set(venues.flatMap(v => v.topics))
  ).sort()

  const set = (patch: Partial<FilterState>) => onChange({ ...state, ...patch })

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 space-y-3">
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="search"
          value={state.search}
          onChange={e => set({ search: e.target.value })}
          placeholder="Search venues…"
          className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <select
          value={state.deadlineWindow}
          onChange={e => set({ deadlineWindow: e.target.value as FilterState['deadlineWindow'] })}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="all">Any deadline</option>
          <option value="open">Currently open</option>
          <option value="30d">≤ 30 days</option>
          <option value="90d">≤ 90 days</option>
          <option value="this-year">This year</option>
          <option value="past">Past</option>
        </select>
        <button
          type="button"
          onClick={() => onChange(EMPTY_FILTERS)}
          className="px-3 py-2 text-sm text-gray-600 hover:text-blue-900"
        >
          Clear filters
        </button>
      </div>

      <FilterGroup label="Indexing" options={['scopus', 'isi', 'dblp']} selected={state.indexing}
        onToggle={v => set({ indexing: toggle(state.indexing, v) })}
        labels={{ scopus: 'Scopus', isi: 'ISI/WoS', dblp: 'DBLP' }} />

      <FilterGroup label="Quartile" options={['Q1', 'Q2', 'Q3', 'Q4']} selected={state.quartiles}
        onToggle={v => set({ quartiles: toggle(state.quartiles, v) })} />

      <FilterGroup label="CORE" options={['A*', 'A', 'B', 'C']} selected={state.cores}
        onToggle={v => set({ cores: toggle(state.cores, v) })} />

      <FilterGroup label="CCF" options={['A', 'B', 'C']} selected={state.ccfs}
        onToggle={v => set({ ccfs: toggle(state.ccfs, v) })} />

      <FilterGroup label="Topics" options={allTopics} selected={state.topics}
        onToggle={v => set({ topics: toggle(state.topics, v) })}
        labelFn={topicLabel} compact />

      <FilterGroup label="Publisher" options={allPublishers} selected={state.publishers}
        onToggle={v => set({ publishers: toggle(state.publishers, v) })} compact />
    </div>
  )
}

function FilterGroup({
  label, options, selected, onToggle, labels, labelFn, compact,
}: {
  label: string
  options: string[]
  selected: Set<string>
  onToggle: (v: string) => void
  labels?: Record<string, string>
  labelFn?: (v: string) => string
  compact?: boolean
}) {
  if (options.length === 0) return null
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 w-20 shrink-0">{label}</span>
      <div className={`flex flex-wrap gap-1 ${compact ? 'max-h-16 overflow-auto' : ''}`}>
        {options.map(opt => {
          const text = labels?.[opt] ?? labelFn?.(opt) ?? opt
          const active = selected.has(opt)
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onToggle(opt)}
              className={`px-2 py-0.5 rounded-full border text-xs transition-colors ${
                active
                  ? 'bg-blue-900 text-white border-blue-900'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
              }`}
            >
              {text}
            </button>
          )
        })}
      </div>
    </div>
  )
}
