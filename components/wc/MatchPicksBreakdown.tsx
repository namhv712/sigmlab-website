'use client'

import { useState } from 'react'
import type { Match, Pick } from '@/lib/wcTypes'
import { result } from '@/lib/wcResult'

// "Ai chọn gì" — for a FINISHED match, reveal which members picked 1 / X / 2.
// The winning column is highlighted; everyone else clearly lost that pick.
export default function MatchPicksBreakdown({ match }: { match: Match }) {
  const [open, setOpen] = useState(false)

  const picks = match.picks ?? []
  if (match.status !== 'finished' || match.score1 == null || match.score2 == null) {
    return null
  }
  if (picks.length === 0) {
    return (
      <p className="mt-3 border-t border-white/10 pt-2.5 text-center text-[11px] text-white/40">
        Không ai chọn trận này
      </p>
    )
  }

  const actual = result(match.score1, match.score2)
  const columns: { code: Pick; label: string }[] = [
    { code: '1', label: match.team1 },
    { code: 'X', label: 'Hòa' },
    { code: '2', label: match.team2 },
  ]
  const byCode = (code: Pick) => picks.filter((p) => p.pick === code)

  return (
    <div className="mt-3 border-t border-white/10 pt-2.5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-white/55 hover:text-wc-gold"
      >
        <span>👀 Ai chọn gì ({picks.length})</span>
        <span className="flex items-center gap-2 normal-case tracking-normal">
          {columns.map((c) => (
            <span key={c.code} className={c.code === actual ? 'text-emerald-300' : 'text-white/40'}>
              {c.code === 'X' ? 'Hòa' : c.code === '1' ? 'Đội 1' : 'Đội 2'} {byCode(c.code).length}
            </span>
          ))}
          <span className="text-white/30">{open ? '▲' : '▼'}</span>
        </span>
      </button>

      {open && (
        <div className="mt-2.5 grid grid-cols-3 gap-2">
          {columns.map((c) => {
            const win = c.code === actual
            const people = byCode(c.code)
            return (
              <div
                key={c.code}
                className={`rounded-lg border p-2 ${
                  win ? 'border-emerald-400/50 bg-emerald-500/10' : 'border-white/10 bg-white/[0.02]'
                }`}
              >
                <div
                  className={`mb-1.5 truncate text-[11px] font-bold ${
                    win ? 'text-emerald-200' : 'text-white/50'
                  }`}
                  title={c.label}
                >
                  {win && '✓ '}
                  {c.label}
                  <span className="ml-1 font-normal opacity-60">({people.length})</span>
                </div>
                <ul className="space-y-0.5">
                  {people.map((p) => (
                    <li
                      key={p.name}
                      className={`truncate text-xs ${win ? 'text-emerald-100' : 'text-white/55'}`}
                      title={p.copiedFrom ? `${p.name} — copy theo ${p.copiedFrom}` : p.name}
                    >
                      {p.name}
                      {p.copiedFrom && (
                        <span className="ml-1 text-[10px] font-semibold text-wc-gold/70">
                          📋←{p.copiedFrom}
                        </span>
                      )}
                    </li>
                  ))}
                  {people.length === 0 && <li className="text-xs text-white/25">—</li>}
                </ul>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
