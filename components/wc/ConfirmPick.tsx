'use client'

import { useEffect, useMemo } from 'react'
import type { Match, Pick } from '@/lib/wcTypes'
import { makeHighlight } from '@/lib/wcStats'

const PICK_LABEL = (m: Match, p: Pick) =>
  p === '1' ? `${m.team1} thắng` : p === '2' ? `${m.team2} thắng` : 'Hòa'

export default function ConfirmPick({
  match,
  pick,
  pending,
  onConfirm,
  onCancel,
}: {
  match: Match
  pick: Pick
  pending?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  // Pick once per dialog mount: either a funny line or a real-sounding (but
  // misleading) stat tied to this match. Stable while the dialog is open.
  const hl = useMemo(() => makeHighlight(match, pick), [match, pick])
  const changing = match.myPick && match.myPick !== pick

  return (
    <div
      className="wc-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="wc-dialog wc-money-card w-full max-w-sm p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-4xl">🎯</div>
        <h3 className="mt-2 text-lg font-extrabold text-white">Xác nhận kèo</h3>

        <p className="mt-1 text-sm text-white/60">
          {match.team1} <span className="text-white/30">vs</span> {match.team2}
        </p>

        <div className="mt-4 rounded-xl border border-wc-gold/40 bg-wc-gold/10 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-wc-gold/70">
            Bạn chọn
          </p>
          <p className="mt-0.5 text-xl font-extrabold text-wc-gold">
            {PICK_LABEL(match, pick)}
          </p>
        </div>

        {hl.kind === 'fun' ? (
          <p className="mt-4 text-sm font-semibold text-amber-200">{hl.text}</p>
        ) : (
          <div className="mt-4 rounded-xl border border-sky-400/30 bg-sky-500/[0.07] px-4 py-3 text-left">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-sky-300/80">
              📊 Phân tích nhanh
            </div>
            <p className="mt-1 text-sm font-medium text-white/85 [font-variant-numeric:tabular-nums]">
              {hl.text}
            </p>
            <p className="mt-1 text-[10px] italic text-white/35">Nguồn: SigM Analytics™</p>
          </div>
        )}
        <p className="mt-2 text-[11px] text-white/45">
          Đoán sai nhận 1 Raptor · còn được đổi đến khi bóng lăn.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-bold text-white/70 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className="rounded-xl bg-gradient-to-b from-[#ffd95e] to-wc-gold px-4 py-2.5 text-sm font-extrabold text-[#0a0e1a] shadow-lg shadow-wc-gold/30 transition hover:brightness-105 disabled:opacity-60"
          >
            {pending ? 'Đang lưu…' : changing ? 'Đổi kèo' : 'Chốt kèo'}
          </button>
        </div>
      </div>
    </div>
  )
}
