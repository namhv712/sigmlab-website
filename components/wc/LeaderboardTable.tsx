'use client'

import type { LeaderRow } from '@/lib/wcTypes'

const MEDALS = ['🥇', '🥈', '🥉']

export default function LeaderboardTable({
  rows,
  highlight,
}: {
  rows: LeaderRow[]
  highlight?: string | null
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center text-sm text-white/50">
        Chưa có ai ghi điểm. Hãy là người đầu tiên!
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-white/[0.06] text-left text-[11px] uppercase tracking-wide text-white/50">
            <th className="px-3 py-2 font-semibold">Hạng</th>
            <th className="px-3 py-2 font-semibold">Tên</th>
            <th className="px-3 py-2 text-center font-semibold">Đúng</th>
            <th className="px-3 py-2 text-right font-semibold">Điểm</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const me = highlight && r.name === highlight
            return (
              <tr
                key={r.name}
                className={`border-t border-white/5 ${
                  me ? 'bg-wc-gold/10' : i % 2 ? 'bg-white/[0.02]' : ''
                }`}
              >
                <td className="px-3 py-2 font-bold text-wc-gold">
                  {MEDALS[i] || i + 1}
                </td>
                <td className="px-3 py-2 font-semibold text-white">
                  {r.name}
                  {me && <span className="ml-1 text-[10px] text-wc-gold">(bạn)</span>}
                </td>
                <td className="px-3 py-2 text-center text-white/60">
                  {r.correct}/{r.played}
                </td>
                <td className="px-3 py-2 text-right font-mono font-bold text-white">
                  {r.points}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
