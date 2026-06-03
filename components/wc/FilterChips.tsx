'use client'

export type WcFilter = 'all' | 'live' | 'upcoming' | 'finished' | 'mine'

const CHIPS: { key: WcFilter; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'live', label: 'Trực tiếp' },
  { key: 'upcoming', label: 'Sắp diễn ra' },
  { key: 'finished', label: 'Đã kết thúc' },
  { key: 'mine', label: 'Cược của tôi' },
]

export default function FilterChips({
  value,
  onChange,
  showMine,
}: {
  value: WcFilter
  onChange: (f: WcFilter) => void
  showMine: boolean
}) {
  const chips = showMine ? CHIPS : CHIPS.filter(c => c.key !== 'mine')
  return (
    <div className="flex flex-wrap gap-2">
      {chips.map(c => {
        const active = value === c.key
        return (
          <button
            key={c.key}
            type="button"
            onClick={() => onChange(c.key)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
              active
                ? 'border-wc-gold bg-wc-gold text-[#0a0e1a]'
                : 'border-white/15 text-white/70 hover:border-wc-gold/60 hover:text-wc-gold'
            }`}
          >
            {c.label}
          </button>
        )
      })}
    </div>
  )
}
