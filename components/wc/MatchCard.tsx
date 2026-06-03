'use client'

import type { Match, Pick } from '@/lib/wcTypes'
import { vnLabel } from '@/lib/wcTime'
import Flag from './Flag'
import CountdownTimer from './CountdownTimer'
import PickButtons from './PickButtons'

const STAGE_LABELS: Record<string, string> = {
  group: 'Vòng bảng',
  r32: 'Vòng 32',
  r16: 'Vòng 16',
  qf: 'Tứ kết',
  sf: 'Bán kết',
  third: 'Tranh hạng 3',
  final: 'Chung kết',
}

function StatusBadge({ status }: { status: Match['status'] }) {
  if (status === 'live') {
    return (
      <span className="wc-live inline-flex items-center gap-1.5 rounded-full bg-red-600/90 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
        <span className="h-1.5 w-1.5 rounded-full bg-white" />
        Trực tiếp
      </span>
    )
  }
  if (status === 'finished') {
    return (
      <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white/60">
        Đã kết thúc
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-full bg-wc-gold/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-wc-gold">
      Sắp diễn ra
    </span>
  )
}

export default function MatchCard({
  match,
  mode,
  onPick,
  pending,
}: {
  match: Match
  mode: 'active' | 'view'
  onPick?: (pick: Pick) => void
  pending?: boolean
}) {
  const { time, date, weekday } = vnLabel(match.kickoff)
  const finished = match.status === 'finished'
  const live = match.status === 'live'
  const hasScore = match.score1 != null && match.score2 != null
  const stageLabel =
    STAGE_LABELS[match.stage] || (match.group ? `Bảng ${match.group}` : match.stage)

  return (
    <article
      className={`wc-card rounded-2xl border p-4 transition-colors ${
        finished
          ? 'border-white/5 bg-white/[0.03] opacity-80'
          : live
            ? 'border-red-500/40 bg-white/[0.06]'
            : 'border-white/10 bg-white/[0.05]'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-white/40">
          {stageLabel}
        </span>
        <StatusBadge status={match.status} />
      </div>

      <div className="mt-1 text-[11px] text-white/50">
        <span className="font-semibold text-white/70">{weekday}</span> {date}
        <span className="mx-1 text-white/30">•</span>
        <span className="font-mono text-wc-gold">{time}</span>
        {match.ground && (
          <>
            <span className="mx-1 text-white/30">•</span>
            <span>{match.ground}</span>
          </>
        )}
      </div>

      {/* Teams + score */}
      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Flag team={match.team1} className="text-2xl" />
          <span className="truncate text-sm font-bold text-white">{match.team1}</span>
        </div>

        <div className="flex-shrink-0 px-2 text-center">
          {hasScore ? (
            <span className="font-mono text-xl font-extrabold text-wc-gold">
              {match.score1} <span className="text-white/40">–</span> {match.score2}
            </span>
          ) : (
            <span className="text-sm font-bold text-white/40">vs</span>
          )}
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          <span className="truncate text-right text-sm font-bold text-white">
            {match.team2}
          </span>
          <Flag team={match.team2} className="text-2xl" />
        </div>
      </div>

      {/* Countdown for upcoming */}
      {match.status === 'upcoming' && (
        <div className="mt-2 text-center text-[11px] text-white/50">
          ⏳ Còn <CountdownTimer target={match.kickoff} className="font-semibold text-wc-gold" />
        </div>
      )}

      {/* Picker / pick result */}
      <PickButtons match={match} mode={mode} onPick={onPick} pending={pending} />
    </article>
  )
}
