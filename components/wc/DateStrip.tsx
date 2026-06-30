'use client'

import { useEffect, useRef } from 'react'
import type { Match } from '@/lib/wcTypes'
import { vnDayKey, vnLabel } from '@/lib/wcTime'

// Horizontal day selector. `selected === null` means "all days".
export default function DateStrip({
  matches,
  selected,
  onSelect,
}: {
  matches: Match[]
  selected: string | null
  onSelect: (day: string | null) => void
}) {
  const selectedRef = useRef<HTMLButtonElement | null>(null)

  // Distinct GMT+7 days, ascending, with a representative epoch for labelling.
  const dayMap = new Map<string, number>()
  for (const m of matches) {
    const key = vnDayKey(m.kickoff)
    if (!dayMap.has(key) || m.kickoff < dayMap.get(key)!) dayMap.set(key, m.kickoff)
  }
  const days = Array.from(dayMap.entries()).sort((a, b) => a[1] - b[1])
  const todayKey = vnDayKey(Math.floor(Date.now() / 1000))

  useEffect(() => {
    if (!selected || days.length === 0) return
    selectedRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    })
  }, [selected, days.length])

  if (days.length === 0) return null

  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`flex-shrink-0 rounded-xl border px-3 py-2 text-xs font-bold transition-colors ${
          selected === null
            ? 'border-wc-gold bg-wc-gold text-[#0a0e1a]'
            : 'border-white/15 text-white/70 hover:border-wc-gold/60'
        }`}
      >
        Tất cả
      </button>
      {days.map(([key, epoch]) => {
        const { weekday, date } = vnLabel(epoch)
        const active = selected === key
        const label = key === todayKey ? 'Hôm nay' : weekday
        return (
          <button
            key={key}
            ref={active ? selectedRef : undefined}
            type="button"
            onClick={() => onSelect(key)}
            className={`flex flex-shrink-0 flex-col items-center rounded-xl border px-3 py-1.5 transition-colors ${
              active
                ? 'border-wc-gold bg-wc-gold text-[#0a0e1a]'
                : 'border-white/15 text-white/70 hover:border-wc-gold/60'
            }`}
          >
            <span className="text-[10px] font-semibold uppercase opacity-80">{label}</span>
            <span className="text-xs font-bold">{date}</span>
          </button>
        )
      })}
    </div>
  )
}
