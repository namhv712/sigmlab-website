'use client'

import type { LeaderRow } from '@/lib/wcTypes'
import { formatVnd } from '@/lib/wcMoney'

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
      <div className="wc-panel p-8 text-center text-sm text-white/50">
        Chưa có ai tham gia. Hãy là người đầu tiên!
      </div>
    )
  }

  return (
    <div className="wc-panel overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-white/[0.06] text-left text-[11px] uppercase tracking-wide text-white/50">
            <th className="px-3 py-3 font-semibold">Hạng</th>
            <th className="px-3 py-3 font-semibold">Tên</th>
            <th className="px-2 py-3 text-center font-semibold">Đúng</th>
            <th className="px-2 py-3 text-center font-semibold">Sai</th>
            <th className="px-2 py-3 text-center font-semibold">Bỏ lỡ</th>
            <th className="px-3 py-3 text-right font-semibold">Tiền</th>
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
                <td className="px-3 py-2.5 text-base font-bold text-wc-gold">
                  {MEDALS[i] || i + 1}
                </td>
                <td className="px-3 py-2.5 font-bold text-white">
                  {r.name}
                  {me && <span className="ml-1 text-[10px] text-wc-gold">(bạn)</span>}
                </td>
                <td className="px-2 py-2.5 text-center font-semibold text-emerald-300/90">
                  {r.correct}
                </td>
                <td className="px-2 py-2.5 text-center text-amber-300/80">{r.wrong}</td>
                <td className="px-2 py-2.5 text-center text-red-400/80">{r.missed}</td>
                <td
                  className={`px-3 py-2.5 text-right font-mono text-sm font-extrabold ${
                    r.vnd < 0 ? 'text-red-400' : 'text-emerald-300'
                  }`}
                >
                  {formatVnd(r.vnd)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
