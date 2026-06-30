'use client'

import type { Match, Pick } from '@/lib/wcTypes'
import { matchLabel } from '@/lib/wcTime'
import Flag from './Flag'
import CountdownTimer from './CountdownTimer'
import PickButtons from './PickButtons'
import MatchPicksBreakdown from './MatchPicksBreakdown'

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
  const { time, date, weekday } = matchLabel(match.kickoff)
  const finished = match.status === 'finished'
  const live = match.status === 'live'
  const hasScore = match.score1 != null && match.score2 != null
  const hasPenalties = match.penalty1 != null && match.penalty2 != null
  const stageLabel =
    STAGE_LABELS[match.stage] || (match.group ? `Bảng ${match.group}` : match.stage)

  return (
    <article
      className={`wc-panel p-4 sm:p-5 ${
        finished
          ? 'opacity-80'
          : live
            ? 'wc-live-panel !border-red-500/40'
            : 'wc-panel-hover'
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
      <div className="mt-3.5 flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <Flag team={match.team1} className="text-3xl" />
          <span className="truncate text-base font-extrabold text-white sm:text-lg">{match.team1}</span>
        </div>

        <div className="flex-shrink-0 px-2 text-center">
          {hasScore ? (
            <>
              <span className="wc-gradient-text font-mono text-2xl font-extrabold sm:text-3xl">
                {match.score1} <span className="opacity-50">–</span> {match.score2}
              </span>
              {hasPenalties && (
                <div className="mt-0.5 font-mono text-[10px] font-bold text-white/45">
                  pen {match.penalty1}–{match.penalty2}
                </div>
              )}
            </>
          ) : (
            <span className="text-sm font-bold text-white/40">vs</span>
          )}
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-2.5">
          <span className="truncate text-right text-base font-extrabold text-white sm:text-lg">
            {match.team2}
          </span>
          <Flag team={match.team2} className="text-3xl" />
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

      {/* Who picked what — revealed only once the match is finished */}
      {finished && <MatchPicksBreakdown match={match} />}
    </article>
  )
}
