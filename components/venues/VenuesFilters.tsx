'use client'

import { useState } from 'react'
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

type Tab = 'all' | 'conferences' | 'journals' | 'workshops'

type Props = {
  state: FilterState
  onChange: (next: FilterState) => void
  venues: VenueWithDerived[]
  tab: Tab
}

function toggle<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set)
  if (next.has(value)) next.delete(value)
  else next.add(value)
  return next
}

function activeCount(s: FilterState): number {
  return s.indexing.size + s.quartiles.size + s.cores.size + s.ccfs.size +
         s.topics.size + s.publishers.size +
         (s.deadlineWindow !== 'all' ? 1 : 0) +
         (s.search ? 1 : 0)
}

export function VenuesFilters({ state, onChange, venues, tab }: Props) {
  const [open, setOpen] = useState(false)

  // Tab-aware visible filter set: only show filters that apply to the active tab.
  const showCore = tab === 'all' || tab === 'conferences'
  const showCcf = tab === 'all' || tab === 'conferences'
  const showQuartile = tab === 'all' || tab === 'journals'
  const showIndexing = tab !== 'workshops'
  const showPublisher = tab !== 'workshops'
  const showDeadline = tab !== 'journals'

  // Restrict the venue universe used for filter option lists to entries
  // matching the active tab — so e.g. Publisher chips don't show
  // journal-only publishers when on the Conferences tab.
  const tabVenues = tab === 'all' ? venues : venues.filter(v => {
    if (tab === 'conferences') return v.type === 'conference'
    if (tab === 'journals') return v.type === 'journal'
    return v.type === 'workshop'
  })
  const allPublishers = Array.from(
    new Set(tabVenues.map(v => v.publisher).filter(Boolean) as string[])
  ).sort()
  const allTopics = Array.from(
    new Set(tabVenues.flatMap(v => v.topics))
  ).sort()

  const set = (patch: Partial<FilterState>) => onChange({ ...state, ...patch })
  const count = activeCount(state)

  return (
    <div className="bg-white border border-gray-200 rounded-lg mb-4">
      <div className="flex flex-wrap gap-2 items-center p-3">
        <input
          type="search"
          value={state.search}
          onChange={e => set({ search: e.target.value })}
          placeholder="Search venues…"
          className="flex-1 min-w-[180px] px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
        />
        {showDeadline && (
          <select
            value={state.deadlineWindow}
            onChange={e => set({ deadlineWindow: e.target.value as FilterState['deadlineWindow'] })}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm bg-white"
          >
            <option value="all">Any deadline</option>
            <option value="open">Currently open</option>
            <option value="30d">≤ 30 days</option>
            <option value="90d">≤ 90 days</option>
            <option value="this-year">This year</option>
            <option value="past">Past</option>
          </select>
        )}
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
            count > 0
              ? 'bg-blue-50 border-blue-300 text-blue-900'
              : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400'
          }`}
        >
          Filters{count > 0 && ` · ${count}`} {open ? '▴' : '▾'}
        </button>
        {count > 0 && (
          <button
            type="button"
            onClick={() => onChange(EMPTY_FILTERS)}
            className="px-2 py-1.5 text-sm text-gray-500 hover:text-blue-900"
          >
            Clear
          </button>
        )}
      </div>

      {open && (
        <div className="border-t border-gray-100 px-3 py-3 space-y-2 bg-gray-50/50">
          {showIndexing && (
            <FilterRow label="Indexing" options={['scopus', 'isi', 'dblp']} selected={state.indexing}
              onToggle={v => set({ indexing: toggle(state.indexing, v) })}
              labels={{ scopus: 'Scopus', isi: 'ISI/WoS', dblp: 'DBLP' }} />
          )}
          {showQuartile && (
            <FilterRow label="Quartile" options={['Q1', 'Q2', 'Q3', 'Q4']} selected={state.quartiles}
              onToggle={v => set({ quartiles: toggle(state.quartiles, v) })} />
          )}
          {showCore && (
            <FilterRow label="CORE" options={['A*', 'A', 'B', 'C']} selected={state.cores}
              onToggle={v => set({ cores: toggle(state.cores, v) })} />
          )}
          {showCcf && (
            <FilterRow label="CCF" options={['A', 'B', 'C']} selected={state.ccfs}
              onToggle={v => set({ ccfs: toggle(state.ccfs, v) })} />
          )}
          <FilterRow label="Topics" options={allTopics} selected={state.topics}
            onToggle={v => set({ topics: toggle(state.topics, v) })}
            labelFn={topicLabel} compact />
          {showPublisher && (
            <FilterRow label="Publisher" options={allPublishers} selected={state.publishers}
              onToggle={v => set({ publishers: toggle(state.publishers, v) })} compact />
          )}
        </div>
      )}
    </div>
  )
}

function FilterRow({
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
    <div className="flex flex-wrap items-start gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 w-16 shrink-0 pt-1">{label}</span>
      <div className={`flex flex-wrap gap-1 flex-1 ${compact ? 'max-h-12 overflow-auto' : ''}`}>
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
