'use client'

import type { Match } from '@/lib/wcTypes'
import { matchLabel } from '@/lib/wcTime'
import { flagFor } from './Flag'
import CountdownTimer from './CountdownTimer'

// "Đang diễn ra" (live matches) + "Trận kế tiếp" (next upcoming with countdown).
export default function NowNextStrip({ matches }: { matches: Match[] }) {
  const live = matches.filter(m => m.status === 'live')
  const now = Date.now() / 1000
  const next = matches
    .filter(m => m.status === 'upcoming' && m.kickoff > now)
    .sort((a, b) => a.kickoff - b.kickoff)[0]
  const nextLabel = next ? matchLabel(next.kickoff) : null

  if (live.length === 0 && !next) return null

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {live.length > 0 && (
        <div className="wc-live-panel rounded-2xl border border-red-500/40 bg-red-600/10 p-4">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-red-300">
            <span className="wc-live h-2 w-2 rounded-full bg-red-400" />
            Đang diễn ra
          </div>
          <div className="mt-2 space-y-1.5">
            {live.map(m => (
              <div key={m.id} className="flex items-center justify-between text-sm text-white">
                <span className="truncate">
                  {flagFor(m.team1)} {m.team1} <span className="text-white/40">vs</span>{' '}
                  {m.team2} {flagFor(m.team2)}
                </span>
                <span className="ml-2 font-mono font-bold text-wc-gold">
                  {m.score1 ?? 0}–{m.score2 ?? 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {next && (
        <div className="rounded-2xl border border-wc-gold/30 bg-wc-gold/5 p-4">
          <div className="text-[11px] font-bold uppercase tracking-wide text-wc-gold">
            Trận kế tiếp
          </div>
          <div className="mt-2 flex items-center justify-between gap-2 text-sm text-white">
            <span className="truncate">
              {flagFor(next.team1)} {next.team1} <span className="text-white/40">vs</span>{' '}
              {next.team2} {flagFor(next.team2)}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-white/60">
            <span>
              {nextLabel?.weekday} {nextLabel?.date} •{' '}
              <span className="font-mono text-wc-gold">{nextLabel?.time}</span>
            </span>
            <span>
              Còn <CountdownTimer target={next.kickoff} className="font-semibold text-wc-gold" />
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
