'use client'

import { useMemo } from 'react'
import { supportedTimeZones } from '@/lib/wcTime'

export default function TimezoneSelect({
  value,
  detectedTimeZone,
  onChange,
}: {
  value: string
  detectedTimeZone: string
  onChange: (timeZone: string) => void
}) {
  const zones = useMemo(() => {
    const all = new Set([detectedTimeZone, value, ...supportedTimeZones()])
    return Array.from(all)
  }, [detectedTimeZone, value])

  return (
    <div className="mx-auto mt-4 flex max-w-lg items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-left">
      <label
        htmlFor="wc-timezone"
        className="flex-shrink-0 text-[11px] font-bold uppercase tracking-wide text-white/45"
      >
        Múi giờ
      </label>
      <select
        id="wc-timezone"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-0 flex-1 rounded-md border border-white/15 bg-[#0a0e1a] px-2 py-1.5 text-xs font-semibold text-wc-gold outline-none transition-colors hover:border-wc-gold/50 focus:border-wc-gold"
      >
        {zones.map((zone) => (
          <option key={zone} value={zone}>
            {zone}
            {zone === detectedTimeZone ? ' (thiết bị)' : ''}
          </option>
        ))}
      </select>
    </div>
  )
}
