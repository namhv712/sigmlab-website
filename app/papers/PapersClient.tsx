'use client'

import { useState, useEffect } from 'react'

interface Paper {
  title: string
  authors: string
  venue: string
  year: number
  url?: string
  image?: string
}

type PapersData = Record<string, Record<string, Paper[]>>

export default function PapersClient() {
  const [data, setData] = useState<PapersData>({})
  const [loading, setLoading] = useState(true)
  const [sliderIndexes, setSliderIndexes] = useState<Record<string, number>>({})

  useEffect(() => {
    fetch('/papers/papers-data.json')
      .then(r => r.json())
      .then((json: PapersData) => {
        setData(json)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  function getKey(category: string, year: string) {
    return `${category}__${year}`
  }

  function getIndex(category: string, year: string) {
    return sliderIndexes[getKey(category, year)] ?? 0
  }

  function setIndex(category: string, year: string, idx: number) {
    setSliderIndexes(prev => ({ ...prev, [getKey(category, year)]: idx }))
  }

  const categoryOrder = [
    'International Journal',
    'National Journals',
    'International Conferences',
    'National Conference',
  ]

  if (loading) {
    return (
      <div className="page-container text-center py-20 text-gray-500">
        Loading papers...
      </div>
    )
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Publications</h1>
      <div className="space-y-12">
        {categoryOrder.map(category => {
          const yearMap = data[category]
          if (!yearMap) return null
          const years = Object.keys(yearMap)
            .map(Number)
            .sort((a, b) => b - a)

          const hasAny = years.some(y => yearMap[String(y)]?.length > 0)
          if (!hasAny) return null

          return (
            <div key={category} className="section-card">
              <h2 className="text-2xl font-bold text-blue-700 mb-6 border-b pb-3">{category}</h2>
              <div className="space-y-8">
                {years.map(year => {
                  const papers = yearMap[String(year)] ?? []
                  if (!papers.length) return null
                  const idx = getIndex(category, String(year))
                  const paper = papers[idx]

                  return (
                    <div key={year}>
                      <h3 className="text-lg font-semibold text-gray-700 mb-4">{year}</h3>
                      <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                        {paper.image && (
                          <img
                            src={paper.image}
                            alt={paper.title}
                            className="max-h-40 object-contain mb-4 rounded"
                          />
                        )}
                        <h4 className="font-semibold text-gray-900 text-base mb-1">
                          {paper.url ? (
                            <a href={paper.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              {paper.title}
                            </a>
                          ) : paper.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-1">{paper.authors}</p>
                        <p className="text-sm text-gray-500 italic">{paper.venue}</p>

                        {papers.length > 1 && (
                          <div className="flex items-center gap-3 mt-4">
                            <button
                              onClick={() => setIndex(category, String(year), Math.max(0, idx - 1))}
                              disabled={idx === 0}
                              className="px-3 py-1 text-sm border rounded disabled:opacity-40 hover:bg-gray-100"
                            >
                              Prev
                            </button>
                            <div className="flex gap-1">
                              {papers.map((_, i) => (
                                <button
                                  key={i}
                                  onClick={() => setIndex(category, String(year), i)}
                                  className={`w-2 h-2 rounded-full ${i === idx ? 'bg-blue-600' : 'bg-gray-300'}`}
                                />
                              ))}
                            </div>
                            <button
                              onClick={() => setIndex(category, String(year), Math.min(papers.length - 1, idx + 1))}
                              disabled={idx === papers.length - 1}
                              className="px-3 py-1 text-sm border rounded disabled:opacity-40 hover:bg-gray-100"
                            >
                              Next
                            </button>
                            <span className="text-sm text-gray-400 ml-2">{idx + 1} / {papers.length}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
