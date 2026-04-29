'use client'

import { useEffect, useMemo, useState } from 'react'

type Paper = {
  title: string
  authors: string
  year: number | null
  venue: string
  topic: string
  lab_authors: string[]
  link?: string
}
type Node = {
  id: string
  name: string
  papers: number
  primary_topic: string
  avatar: string
  no_data?: boolean
}
type NetworkData = {
  nodes: Node[]
  papers: Paper[]
  topics: { key: string; color: string }[]
}

export default function PapersClient() {
  const [data, setData] = useState<NetworkData | null>(null)
  const [view, setView] = useState<'timeline' | 'list'>('timeline')

  // Filters
  const [search, setSearch] = useState('')
  const [activeTopics, setActiveTopics] = useState<Set<string>>(new Set())
  const [activeAuthors, setActiveAuthors] = useState<Set<string>>(new Set())
  const [yearMin, setYearMin] = useState<number | null>(null)
  const [yearMax, setYearMax] = useState<number | null>(null)
  const [authorPickerOpen, setAuthorPickerOpen] = useState(false)
  const [authorQuery, setAuthorQuery] = useState('')

  useEffect(() => {
    fetch('/papers/network.json')
      .then(r => r.json())
      .then((d: NetworkData) => {
        setData(d)
        const years = d.papers.map(p => p.year).filter((y): y is number => y != null)
        if (years.length) { setYearMin(Math.min(...years)); setYearMax(Math.max(...years)) }
      })
  }, [])

  const topicColor = useMemo(() => {
    const m = new Map<string, string>()
    data?.topics.forEach(t => m.set(t.key, t.color))
    return (k: string) => m.get(k) || '#7CD2FF'
  }, [data])

  const nodeById = useMemo(() => {
    const m = new Map<string, Node>()
    data?.nodes.forEach(n => m.set(n.id, n))
    return m
  }, [data])

  const filtered = useMemo(() => {
    if (!data) return []
    const q = search.trim().toLowerCase()
    return data.papers.filter(p => {
      if (yearMin != null && (p.year ?? 0) < yearMin) return false
      if (yearMax != null && (p.year ?? 9999) > yearMax) return false
      if (activeTopics.size > 0 && !activeTopics.has(p.topic)) return false
      if (activeAuthors.size > 0 && !p.lab_authors.some(a => activeAuthors.has(a))) return false
      if (q) {
        const blob = (p.title + ' ' + p.authors + ' ' + p.venue).toLowerCase()
        if (!blob.includes(q)) return false
      }
      return true
    })
  }, [data, search, activeTopics, activeAuthors, yearMin, yearMax])

  const papersByYear = useMemo(() => {
    const map = new Map<number, Paper[]>()
    filtered.forEach(p => {
      if (p.year == null) return
      if (!map.has(p.year)) map.set(p.year, [])
      map.get(p.year)!.push(p)
    })
    return Array.from(map.entries()).sort((a, b) => b[0] - a[0])
  }, [filtered])

  if (!data) return (
    <div className="min-h-screen bg-white grid place-items-center">
      <div className="text-gray-400 text-sm">Loading…</div>
    </div>
  )

  const dataYearMin = Math.min(...data.papers.map(p => p.year ?? 9999))
  const dataYearMax = Math.max(...data.papers.map(p => p.year ?? 0))
  const visibleAuthors = data.nodes
    .filter(n => !n.no_data)
    .filter(n => !authorQuery || n.name.toLowerCase().includes(authorQuery.toLowerCase()))
    .sort((a, b) => b.papers - a.papers)

  const hasAnyFilter = search || activeTopics.size > 0 || activeAuthors.size > 0 ||
    yearMin !== dataYearMin || yearMax !== dataYearMax

  const clearFilters = () => {
    setSearch(''); setActiveTopics(new Set()); setActiveAuthors(new Set())
    setYearMin(dataYearMin); setYearMax(dataYearMax)
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-6">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">Publications</h1>
            <p className="mt-2 text-sm text-gray-500">{filtered.length} of {data.papers.length} papers · {data.nodes.filter(n => !n.no_data).length} authors indexed</p>
          </div>
          <div className="inline-flex rounded-full border border-gray-200 p-0.5 text-xs">
            <button
              onClick={() => setView('timeline')}
              className={`px-4 py-1.5 rounded-full transition-colors ${view==='timeline' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-900'}`}
            >Timeline</button>
            <button
              onClick={() => setView('list')}
              className={`px-4 py-1.5 rounded-full transition-colors ${view==='list' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-900'}`}
            >List</button>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="sticky top-16 z-30 bg-white/85 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 space-y-3">
          {/* Row 1: search + clear */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[240px]">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search papers, authors, venues…"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
              />
              <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="font-mono">{yearMin}</span>
              <input type="range" min={dataYearMin} max={dataYearMax} value={yearMin ?? dataYearMin}
                     onChange={e => setYearMin(parseInt(e.target.value))}
                     className="w-24 accent-gray-900" />
              <span className="text-gray-300">–</span>
              <input type="range" min={dataYearMin} max={dataYearMax} value={yearMax ?? dataYearMax}
                     onChange={e => setYearMax(parseInt(e.target.value))}
                     className="w-24 accent-gray-900" />
              <span className="font-mono">{yearMax}</span>
            </div>
            {hasAnyFilter && (
              <button onClick={clearFilters} className="text-xs text-gray-500 hover:text-gray-900 underline-offset-2 hover:underline">Clear</button>
            )}
          </div>

          {/* Row 2: topic chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {data.topics.filter(t => t.key !== 'Other').map(t => {
              const active = activeTopics.has(t.key)
              return (
                <button
                  key={t.key}
                  onClick={() => {
                    const next = new Set(activeTopics)
                    if (next.has(t.key)) next.delete(t.key); else next.add(t.key)
                    setActiveTopics(next)
                  }}
                  className={`px-2.5 py-1 rounded-full border text-[11px] transition-all ${active ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 hover:border-gray-400'}`}
                  style={!active ? { color: t.color } : undefined}
                >
                  {t.key}
                </button>
              )
            })}
          </div>

          {/* Row 3: authors */}
          <div className="flex items-center gap-2 flex-wrap relative">
            <button
              onClick={() => setAuthorPickerOpen(o => !o)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 hover:border-gray-400 text-xs"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              Authors {activeAuthors.size > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-gray-900 text-white text-[10px]">{activeAuthors.size}</span>}
            </button>
            {Array.from(activeAuthors).map(aid => {
              const n = nodeById.get(aid); if (!n) return null
              return (
                <span key={aid} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-100 text-xs">
                  {n.avatar && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={n.avatar} alt="" className="w-4 h-4 rounded-full object-cover" />
                  )}
                  <span>{n.name}</span>
                  <button onClick={() => {
                    const next = new Set(activeAuthors); next.delete(aid); setActiveAuthors(next)
                  }} className="text-gray-400 hover:text-gray-900">×</button>
                </span>
              )
            })}

            {authorPickerOpen && (
              <div className="absolute left-0 top-full mt-1 w-[320px] bg-white border border-gray-200 rounded-lg shadow-xl z-40 max-h-[360px] overflow-hidden flex flex-col">
                <div className="p-2 border-b border-gray-100">
                  <input
                    autoFocus
                    value={authorQuery}
                    onChange={e => setAuthorQuery(e.target.value)}
                    placeholder="Filter authors…"
                    className="w-full bg-gray-50 border border-gray-200 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:border-gray-400"
                  />
                </div>
                <div className="overflow-y-auto">
                  {visibleAuthors.map(n => {
                    const checked = activeAuthors.has(n.id)
                    return (
                      <button
                        key={n.id}
                        onClick={() => {
                          const next = new Set(activeAuthors)
                          if (next.has(n.id)) next.delete(n.id); else next.add(n.id)
                          setActiveAuthors(next)
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-gray-50 text-left"
                      >
                        {n.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={n.avatar} alt="" className="w-6 h-6 rounded-full object-cover ring-1"
                               style={{ borderColor: topicColor(n.primary_topic) }} />
                        ) : (
                          <span className="w-6 h-6 rounded-full bg-gray-100 grid place-items-center text-[8px] text-gray-400 ring-1"
                                style={{ borderColor: topicColor(n.primary_topic) }}>
                            {n.name.split(' ').map(w => w[0]).slice(0,2).join('')}
                          </span>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="truncate text-xs">{n.name}</div>
                          <div className="text-[10px] text-gray-400">{n.papers} papers</div>
                        </div>
                        <input type="checkbox" checked={checked} readOnly className="accent-gray-900" />
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-sm">No papers match the current filters.</div>
        ) : view === 'timeline' ? (
          <Timeline byYear={papersByYear} topicColor={topicColor} nodeById={nodeById} setSelectedAuthor={(id: string) => {
            const next = new Set(activeAuthors); next.add(id); setActiveAuthors(next)
          }} />
        ) : (
          <ul className="divide-y divide-gray-100">
            {filtered.map((p, i) => (
              <PaperListItem key={`${p.title}-${i}`} p={p} topicColor={topicColor} nodeById={nodeById} onAuthorClick={id => {
                const next = new Set(activeAuthors); next.add(id); setActiveAuthors(next)
              }} />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function Timeline({ byYear, topicColor, nodeById, setSelectedAuthor }: {
  byYear: [number, Paper[]][]
  topicColor: (k: string) => string
  nodeById: Map<string, Node>
  setSelectedAuthor: (id: string) => void
}) {
  return (
    <div className="relative pl-6 sm:pl-10">
      <div className="absolute top-0 bottom-0 left-[5px] sm:left-[15px] w-px bg-gray-200" />
      <div className="space-y-12">
        {byYear.map(([year, papers]) => (
          <section key={year} className="relative">
            <div className="absolute left-[-22px] sm:left-[-32px] top-0 flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-gray-900 ring-4 ring-white"></div>
            </div>
            <div className="flex items-baseline gap-3 mb-4">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">{year}</h2>
              <span className="text-xs text-gray-400">{papers.length} {papers.length === 1 ? 'paper' : 'papers'}</span>
            </div>
            <ul className="space-y-3">
              {papers.map((p, i) => (
                <PaperCard key={`${year}-${i}`} p={p} topicColor={topicColor} nodeById={nodeById} onAuthorClick={setSelectedAuthor} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}

function PaperCard({ p, topicColor, nodeById, onAuthorClick }: {
  p: Paper
  topicColor: (k: string) => string
  nodeById: Map<string, Node>
  onAuthorClick: (id: string) => void
}) {
  return (
    <li className="group rounded-xl border border-gray-100 hover:border-gray-300 bg-white px-4 py-3 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-medium leading-snug text-gray-900">
            {p.link ? (
              <a href={p.link} target="_blank" rel="noopener noreferrer"
                 className="hover:text-gray-600 underline-offset-2 group-hover:underline">{p.title}</a>
            ) : p.title}
          </h3>
          <p className="text-xs text-gray-500 mt-1 truncate">{p.authors}</p>
          {p.venue && (
            <p className="text-xs text-gray-400 italic mt-0.5 truncate">{p.venue}</p>
          )}
          {p.lab_authors.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {p.lab_authors.slice(0, 8).map(aid => {
                const n = nodeById.get(aid)
                if (!n) return null
                return (
                  <button key={aid} onClick={() => onAuthorClick(aid)}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md hover:bg-gray-100 text-[10px] transition-colors">
                    {n.avatar && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={n.avatar} alt="" className="w-3.5 h-3.5 rounded-full object-cover" />
                    )}
                    <span className="text-gray-600">{n.name}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
        <span className="px-2 py-0.5 text-[10px] rounded-full border whitespace-nowrap"
              style={{ color: topicColor(p.topic), borderColor: topicColor(p.topic) + '40' }}>
          {p.topic}
        </span>
      </div>
    </li>
  )
}

function PaperListItem({ p, topicColor }: {
  p: Paper
  topicColor: (k: string) => string
  nodeById: Map<string, Node>
  onAuthorClick: (id: string) => void
}) {
  return (
    <li className="py-3.5 group">
      <div className="flex items-start gap-4">
        <div className="font-mono text-xs text-gray-400 pt-0.5 w-12 flex-shrink-0">{p.year ?? '—'}</div>
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-medium leading-snug text-gray-900">
            {p.link ? (
              <a href={p.link} target="_blank" rel="noopener noreferrer"
                 className="hover:text-gray-600 group-hover:underline underline-offset-2">{p.title}</a>
            ) : p.title}
          </h3>
          <p className="text-xs text-gray-500 mt-1 truncate">{p.authors}</p>
          {p.venue && <p className="text-xs text-gray-400 italic mt-0.5 truncate">{p.venue}</p>}
        </div>
        <span className="px-2 py-0.5 text-[10px] rounded-full border flex-shrink-0"
              style={{ color: topicColor(p.topic), borderColor: topicColor(p.topic) + '40' }}>
          {p.topic}
        </span>
      </div>
    </li>
  )
}
