'use client'

import type { Match } from '@/lib/wcTypes'
import { tally } from '@/lib/wcMoney'
import { dinoSummary } from '@/lib/wcDinos'

// Top-of-page dinosaur strip for the logged-in member: wrong picks become
// Raptors, missed picks become T-Rexes. Cash values stay out of the UI.
export default function MoneySummary({
  matches,
  name,
}: {
  matches: Match[]
  name: string
}) {
  const t = tally(matches)
  const dinoText = dinoSummary({
    raptors: t.wrong,
    trexes: t.missed,
    total: t.wrong + t.missed,
  })
  const hasDinos = t.wrong + t.missed > 0

  return (
    <div className="wc-money-card p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-wc-gold/80">
            Đàn khủng long của {name}
          </p>
          <p className={`mt-1 text-2xl font-black leading-tight sm:text-3xl ${
            hasDinos ? 'text-wc-gold' : 'text-emerald-300'
          }`}>
            {dinoText}
          </p>
          <p className="mt-1.5 text-xs text-white/55">
            {t.finished > 0
              ? `Tính trên ${t.finished} trận đã kết thúc`
            : 'Chưa có trận nào kết thúc'}
          </p>
        </div>
        <div className="text-6xl sm:text-7xl">{hasDinos ? '🦖' : '🥚'}</div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Stat label="Đúng" value={t.correct} tone="ok" sub="Không nuôi" />
        <Stat label="Sai" value={t.wrong} tone="warn" sub="Raptor" />
        <Stat label="Bỏ lỡ" value={t.missed} tone="bad" sub="T-Rex" />
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
  sub,
  tone,
}: {
  label: string
  value: number
  sub: string
  tone: 'ok' | 'warn' | 'bad'
}) {
  const color =
    tone === 'ok' ? 'text-emerald-300' : tone === 'warn' ? 'text-amber-300' : 'text-red-400'
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] px-2 py-2.5 text-center">
      <div className={`text-xl font-extrabold ${color}`}>{value}</div>
      <div className="text-[11px] font-semibold text-white/60">{label}</div>
      <div className="text-[10px] text-white/35">{sub}</div>
    </div>
  )
}
