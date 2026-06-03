'use client'

import { useEffect, useState } from 'react'
import { countdown } from '@/lib/wcTime'

// Ticks every second client-side, showing a live GMT+7-agnostic countdown
// to the given kickoff (epoch seconds).
export default function CountdownTimer({
  target,
  className,
}: {
  target: number
  className?: string
}) {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000))

  useEffect(() => {
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000)
    return () => clearInterval(id)
  }, [])

  return <span className={className}>{countdown(target, now)}</span>
}
