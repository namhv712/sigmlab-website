'use client'

import { useEffect } from 'react'
import type { Match, Pick } from '@/lib/wcTypes'
import { FINE_WRONG } from '@/lib/wcMoney'

const PICK_LABEL = (m: Match, p: Pick) =>
  p === '1' ? `${m.team1} thắng` : p === '2' ? `${m.team2} thắng` : 'Hòa'

// Playful lines reminding the bettor what a wrong guess costs (30k).
const FUN_LINES = [
  'Sai là mất 30.000đ đó nha, suy nghĩ kỹ chưa? 💸',
  'Chốt kèo này, lỡ sai thì rút ví 30.000đ đấy! 🤑',
  'Tự tin chưa? Đoán trật là đi 30.000đ tiền trà sữa 🧋',
  'Kèo này mà sai thì 30.000đ bay màu nhé 😎',
  'Trật là mất 30.000đ, đủ một tô phở đó nha! 🍜',
  'Đoán sai = nuôi heo đất của lab thêm 30.000đ 🐷',
  'Tay nhanh hơn não là mất 30.000đ đấy sếp ơi ✋',
  'Não cá vàng chốt bừa là 30.000đ rời ví nha 🐠',
  'Sai một ly đi 30.000đ một dặm, cân nhắc nhé 🏃',
  'Chốt đi! Sai thì coi như ủng hộ quỹ trà chanh 30.000đ 🍹',
  'Lỡ sai mất 30.000đ, nhưng bỏ trống còn đau hơn — 100.000đ lận! 😵',
  'Kèo thơm hay kèo thúi? Đoán trật là 30.000đ bay liền 👃',
  'Hên xui đoán bừa, gãy kèo là 30.000đ ra đi mãi mãi 🎲',
  'Chốt cho máu! Sai thì khao cả team 30.000đ trà sữa nha 🧋',
]

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

  // Deterministic "random" line so it doesn't flicker on re-render.
  const fun = FUN_LINES[(match.team1.length + pick.charCodeAt(0)) % FUN_LINES.length]
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

        <p className="mt-4 text-sm font-semibold text-amber-200">{fun}</p>
        <p className="mt-1 text-[11px] text-white/45">
          Đoán sai phạt {FINE_WRONG.toLocaleString('vi-VN')}đ · còn được đổi đến khi bóng lăn.
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
