'use client'

import type { Match, Pick } from '@/lib/wcTypes'
import { result } from '@/lib/wcResult'

// Three 1X2 buttons: Đội 1 / Hòa / Đội 2.
// Modes:
//  - active   : selectable, fires onPick (betting mode, upcoming match)
//  - view     : disabled, shows "Nhập mật khẩu để cược" CTA
//  - locked   : match started / finished, shows the user's locked pick
//  - result   : finished match, marks pick ✓ / ✗ with +3 when correct
export default function PickButtons({
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
  const finished = match.status === 'finished'
  const locked = match.status !== 'upcoming'
  const pick = match.myPick ?? null
  const actual =
    finished && match.score1 != null && match.score2 != null
      ? result(match.score1, match.score2)
      : null

  // View mode on an upcoming match → CTA to unlock betting.
  if (mode === 'view' && !locked) {
    return (
      <div className="mt-4">
        <button
          type="button"
          disabled
          className="w-full cursor-default rounded-xl border border-dashed border-wc-gold/40 bg-white/5 px-3 py-2.5 text-sm font-semibold text-wc-gold/80"
        >
          🔒 Đăng nhập để cược
        </button>
      </div>
    )
  }

  // Locked finished match where the member never picked → "không chọn" (-100k).
  const missed = finished && pick == null

  const options: { code: Pick; label: string }[] = [
    { code: '1', label: 'Đội 1' },
    { code: 'X', label: 'Hòa' },
    { code: '2', label: 'Đội 2' },
  ]

  return (
    <>
      <div className="mt-4 grid grid-cols-3 gap-2.5">
        {options.map(opt => {
          const selected = pick === opt.code
          const isActual = actual === opt.code
          const correct = finished && selected && isActual
          const wrong = finished && selected && !isActual

          let cls =
            'relative rounded-xl border px-2 py-2.5 text-sm font-bold transition-all '
          if (correct) {
            cls += 'border-emerald-400 bg-emerald-500/20 text-emerald-200'
          } else if (wrong) {
            cls += 'border-red-500 bg-red-600/20 text-red-200'
          } else if (selected) {
            cls += 'wc-pick-selected border'
          } else if (finished && isActual) {
            cls += 'border-emerald-400/40 text-emerald-200/70'
          } else if (locked) {
            cls += 'border-white/10 text-white/40'
          } else {
            cls += 'border-white/15 text-white/80 hover:-translate-y-0.5 hover:border-wc-gold hover:text-wc-gold'
          }

          return (
            <button
              key={opt.code}
              type="button"
              disabled={locked || pending || mode !== 'active'}
              aria-pressed={selected}
              onClick={() => onPick?.(opt.code)}
              className={cls}
            >
              {opt.label}
              {correct && <span className="ml-1">✓</span>}
              {wrong && <span className="ml-1">✗ -30k</span>}
            </button>
          )
        })}
      </div>

      {missed && (
        <p className="mt-2 text-center text-[11px] font-semibold text-red-300/80">
          Không chọn trận này · phạt 100.000đ
        </p>
      )}
    </>
  )
}
