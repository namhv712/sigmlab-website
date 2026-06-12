'use client'

import type { LeaderRow } from '@/lib/wcTypes'
import {
  contributionOf,
  dinoSummary,
  dinoTallyFromRow,
  prestigeTier,
  prestigeTitle,
  type PrestigeTier,
} from '@/lib/wcDinos'

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

  const maxContribution = Math.max(0, ...rows.map(contributionOf))

  return (
    <div className="wc-panel overflow-x-auto">
      <table className="w-full min-w-[650px] text-sm">
        <thead>
          <tr className="bg-white/[0.06] text-left text-[11px] uppercase tracking-wide text-white/50">
            <th className="px-3 py-3 font-semibold">Hạng</th>
            <th className="px-3 py-3 font-semibold">Tên</th>
            <th className="px-2 py-3 text-center font-semibold">Đúng</th>
            <th className="px-2 py-3 text-center font-semibold">Sai</th>
            <th className="px-2 py-3 text-center font-semibold">Bỏ lỡ</th>
            <th className="px-3 py-3 text-right font-semibold">Đàn khủng long</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const me = highlight && r.name === highlight
            const prestige = prestigeTier(r, maxContribution)
            const tally = dinoTallyFromRow(r)
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
                <td className="px-3 py-3">
                  <div className={nameClass(prestige)}>
                    {r.name}
                    {me && <span className="ml-1 align-middle text-[10px] text-wc-gold">(bạn)</span>}
                  </div>
                  <div className={titleClass(prestige)}>{prestigeTitle(prestige)}</div>
                </td>
                <td className="px-2 py-2.5 text-center font-semibold text-emerald-300/90">
                  {r.correct}
                </td>
                <td className="px-2 py-2.5 text-center text-amber-300/80">{r.wrong}</td>
                <td className="px-2 py-2.5 text-center text-red-400/80">{r.missed}</td>
                <td className="px-3 py-2.5 text-right text-xs font-black text-white">
                  {tally.total > 0 ? (
                    <span className="inline-flex flex-col items-end gap-0.5">
                      <span className="text-sm text-wc-gold">{dinoSummary(tally)}</span>
                      <span className="text-[10px] uppercase tracking-wide text-white/35">
                        {prestige === 'legend' ? 'danh dự tối cao' : 'đóng góp cho đàn'}
                      </span>
                    </span>
                  ) : (
                    <span className="text-white/35">Chưa có khủng long</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function nameClass(tier: PrestigeTier): string {
  const base = 'break-words font-black leading-tight'
  if (tier === 'legend') return `${base} wc-gradient-text text-xl drop-shadow-[0_0_16px_rgba(255,199,44,0.35)] sm:text-2xl`
  if (tier === 'noble') return `${base} text-lg text-wc-gold sm:text-xl`
  if (tier === 'supporter') return `${base} text-base text-white sm:text-lg`
  return `${base} text-sm text-white`
}

function titleClass(tier: PrestigeTier): string {
  const base = 'mt-0.5 text-[10px] font-bold uppercase tracking-[0.14em]'
  if (tier === 'legend') return `${base} text-wc-gold/80`
  if (tier === 'noble') return `${base} text-amber-200/65`
  if (tier === 'supporter') return `${base} text-white/45`
  return `${base} text-white/25`
}
