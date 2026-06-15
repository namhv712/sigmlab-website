'use client'

import { useEffect, useRef } from 'react'
import type { DinoCelebration as DinoCelebrationData } from '@/lib/wcDinos'

// Tier → colour, matching DinosaurFundTotal: purple legendary, gold giant,
// white singles.
function partClass(tier: DinoCelebrationData['parts'][number]['tier']): string {
  switch (tier) {
    case 'legendary':
      return 'text-purple-300 drop-shadow-[0_0_10px_rgba(168,85,247,0.6)]'
    case 'giant':
      return 'text-wc-gold drop-shadow-[0_0_8px_rgba(255,199,44,0.5)]'
    default:
      return 'text-white'
  }
}

// Headline that scales the hype with how big the herd has grown.
function headline(data: DinoCelebrationData): string {
  if (data.legendary) return '🏆 ĐÀN HUYỀN THOẠI GIÁNG TRẦN!'
  if (data.total >= 50) return '🔥 Đàn khủng long bùng nổ!'
  if (data.total >= 10) return '🎉 Đàn khủng long lớn mạnh!'
  return '🎉 Có khủng long mới về đàn!'
}

// Full-screen congratulations popup with canvas-confetti fireworks. Shown right
// after login when the member's herd has grown (see dinoCelebration).
export default function DinoCelebration({
  data,
  onClose,
}: {
  data: DinoCelebrationData
  onClose: () => void
}) {
  const stopRef = useRef(false)

  useEffect(() => {
    stopRef.current = false
    let cancelled = false
    // Import dynamically so the lib (which touches `document`) never runs on the
    // server and stays out of the initial bundle.
    import('canvas-confetti').then(({ default: confetti }) => {
      if (cancelled) return
      const colors = data.legendary
        ? ['#a855f7', '#c084fc', '#f3e8ff', '#ffc72c']
        : ['#ffc72c', '#ffe08a', '#ff5e5e', '#5ee0ff', '#7dffa3']
      const end = performance.now() + (data.legendary ? 5200 : 3600)

      // Random fireworks bursts across the upper half of the screen.
      const burst = () => {
        if (stopRef.current || performance.now() > end) return
        confetti({
          particleCount: data.legendary ? 80 : 55,
          startVelocity: 38,
          spread: 360,
          ticks: 70,
          gravity: 0.9,
          scalar: 1.05,
          origin: {
            x: 0.15 + Math.random() * 0.7,
            y: 0.15 + Math.random() * 0.35,
          },
          colors,
          disableForReducedMotion: true,
        })
        setTimeout(burst, 320)
      }

      // Steady side-cannon streams for a celebratory frame.
      const stream = () => {
        if (stopRef.current || performance.now() > end) return
        confetti({ particleCount: 5, angle: 60, spread: 60, origin: { x: 0 }, colors, disableForReducedMotion: true })
        confetti({ particleCount: 5, angle: 120, spread: 60, origin: { x: 1 }, colors, disableForReducedMotion: true })
        requestAnimationFrame(stream)
      }

      burst()
      stream()
    })

    return () => {
      cancelled = true
      stopRef.current = true
    }
  }, [data])

  return (
    <div
      className="fixed inset-0 z-[70] grid place-items-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Chúc mừng khủng long mới"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-md overflow-hidden rounded-3xl border bg-gradient-to-b from-[#101a36] to-[#0a0e1a] px-6 py-8 text-center shadow-2xl ${
          data.legendary
            ? 'border-purple-400/50 shadow-purple-500/20'
            : 'border-wc-gold/45 shadow-wc-gold/10'
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-white/40 hover:text-white"
          aria-label="Đóng"
        >
          ✕
        </button>

        <p className="text-base font-extrabold tracking-wide text-wc-gold">
          {headline(data)}
        </p>

        <div className="mt-4 flex items-end justify-center gap-2">
          <span
            className={`text-7xl font-black leading-none ${
              data.legendary
                ? 'text-purple-300 drop-shadow-[0_0_16px_rgba(168,85,247,0.65)]'
                : 'text-white drop-shadow-[0_0_12px_rgba(255,199,44,0.4)]'
            }`}
          >
            {data.total}
          </span>
          <span className="pb-2 text-lg font-bold text-white/70">con</span>
        </div>

        <p className="mt-1 text-sm font-black uppercase tracking-[0.18em] text-wc-gold/80">
          Tổng đàn khủng long
        </p>

        <p className="mt-3 inline-block rounded-full bg-emerald-500/15 px-4 py-1.5 text-sm font-extrabold text-emerald-300 ring-1 ring-emerald-400/30">
          +{data.delta} con mới về đàn!
        </p>

        <div className="mt-5 text-3xl leading-none" aria-hidden="true">
          {data.legendary ? '🦖🦕🦖🦕🦖' : data.total >= 10 ? '🦖🦕🦖' : '🦖🦕'}
        </div>

        <p className="mt-5 text-base font-black leading-snug text-white">
          {data.parts.map((part, i) => (
            <span key={part.text}>
              {i > 0 ? ' · ' : ''}
              <span className={partClass(part.tier)}>{part.text}</span>
            </span>
          ))}
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-7 w-full rounded-xl bg-wc-gold px-4 py-3 text-base font-extrabold text-[#0a0e1a] transition-opacity hover:opacity-90"
        >
          Tuyệt vời! 🎊
        </button>
      </div>
    </div>
  )
}
