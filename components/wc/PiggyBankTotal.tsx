'use client'

import type { LeaderRow } from '@/lib/wcTypes'
import { formatVnd } from '@/lib/wcMoney'

type PiggyTier = 'hungry' | 'happy' | 'rich'

const ONE_MILLION = 1_000_000
const FIVE_MILLION = 5_000_000

const DIALOGUES: Record<PiggyTier, string[]> = {
  hungry: ['Hãy cho tôi ăn thêm!', 'Bụng tôi còn kêu leng keng...'],
  happy: ['No bụng rồi nha!', 'Thêm chút nữa là vàng óng!'],
  rich: ['Két đã đầy xu rồi!', 'Tôi cười tới mang tai!'],
}

export function collectedTotal(rows: LeaderRow[]): number {
  return rows.reduce((sum, row) => sum + Math.max(0, -row.vnd), 0)
}

function tierFor(total: number): PiggyTier {
  if (total < ONE_MILLION) return 'hungry'
  if (total < FIVE_MILLION) return 'happy'
  return 'rich'
}

export default function PiggyBankTotal({ rows }: { rows: LeaderRow[] }) {
  const total = collectedTotal(rows)
  const tier = tierFor(total)
  const label =
    tier === 'hungry'
      ? 'Heo đất đang đói'
      : tier === 'happy'
        ? 'Heo đất hồng hào'
        : 'Heo đất sung túc'

  return (
    <aside
      aria-label="Tổng tiền đã thu"
      className="relative z-40 w-[132px] sm:fixed sm:right-5 sm:top-20 sm:w-[158px]"
    >
      <div
        className="group relative rounded-2xl border border-wc-gold/30 bg-[rgba(8,12,24,0.78)] px-3 py-3 text-center shadow-2xl shadow-black/35 backdrop-blur-md outline-none transition hover:-translate-y-0.5 hover:border-wc-gold/60 focus-visible:border-wc-gold focus-visible:ring-2 focus-visible:ring-wc-gold/50"
        tabIndex={0}
      >
        <div className="pointer-events-none absolute right-0 top-full mt-2 w-48 rounded-2xl border border-white/15 bg-white px-3 py-2 text-left text-[11px] font-bold leading-snug text-slate-900 opacity-0 shadow-xl transition duration-200 group-hover:opacity-100 group-focus:opacity-100 sm:right-full sm:top-2 sm:mr-3 sm:mt-0">
          <span className="absolute -top-1 right-8 h-3 w-3 rotate-45 border-l border-t border-white/15 bg-white sm:-right-1 sm:top-4 sm:border-l-0 sm:border-r sm:border-t" />
          {DIALOGUES[tier].map((line) => (
            <span key={line} className="block">
              Heo: {line}
            </span>
          ))}
        </div>

        <PiggyIllustration tier={tier} label={label} />

        <p className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-wc-gold/80">
          Tổng đã thu
        </p>
        <p className="mt-0.5 font-mono text-lg font-black leading-tight text-white sm:text-xl">
          {formatVnd(total)}
        </p>
      </div>
    </aside>
  )
}

function PiggyIllustration({ tier, label }: { tier: PiggyTier; label: string }) {
  const isHungry = tier === 'hungry'
  const isHappy = tier === 'happy'
  const isRich = tier === 'rich'
  const body = isHungry ? '#f2a6b3' : isHappy ? '#ff7f95' : '#f6c445'
  const bodyDark = isHungry ? '#c86c7b' : isHappy ? '#d94767' : '#c58b11'
  const blush = isRich ? '#f49f22' : '#ffb5c2'

  return (
    <svg
      aria-label={label}
      role="img"
      viewBox="0 0 180 142"
      className="mx-auto h-auto w-full"
    >
      {isRich && (
        <g aria-hidden="true">
          <CoinStack x={15} y={82} count={4} />
          <CoinStack x={128} y={64} count={6} />
          <CoinStack x={142} y={92} count={3} />
          <circle cx="42" cy="34" r="7" fill="#ffd967" stroke="#b98010" strokeWidth="3" />
          <circle cx="133" cy="30" r="6" fill="#ffd967" stroke="#b98010" strokeWidth="3" />
          <circle cx="116" cy="49" r="5" fill="#ffd967" stroke="#b98010" strokeWidth="3" />
        </g>
      )}

      <ellipse cx="91" cy="121" rx={isHungry ? '52' : '65'} ry="9" fill="rgba(0,0,0,0.22)" />

      <path
        d={
          isHungry
            ? 'M48 74c0-23 16-41 43-41 29 0 48 15 48 40 0 26-18 43-49 43-28 0-42-17-42-42Z'
            : 'M34 75c0-31 25-53 59-53 38 0 63 21 63 52 0 34-26 55-65 55-35 0-57-21-57-54Z'
        }
        fill={body}
        stroke={bodyDark}
        strokeWidth="5"
        strokeLinejoin="round"
      />

      <path
        d={isHungry ? 'M73 31l-10-16 23 8Z' : 'M72 25 60 6l30 10Z'}
        fill={body}
        stroke={bodyDark}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path
        d={isHungry ? 'M118 31l13-15 5 24Z' : 'M123 25l19-17 2 31Z'}
        fill={body}
        stroke={bodyDark}
        strokeWidth="5"
        strokeLinejoin="round"
      />

      <rect
        x={isHungry ? '77' : '70'}
        y={isHungry ? '40' : '34'}
        width={isHungry ? '36' : '50'}
        height="7"
        rx="4"
        fill={isRich ? '#7c5208' : '#8d3341'}
        opacity="0.55"
      />

      <circle cx={isHungry ? '75' : '73'} cy={isHungry ? '69' : '68'} r="5" fill="#29141b" />
      <circle cx={isHungry ? '108' : '113'} cy={isHungry ? '69' : '68'} r="5" fill="#29141b" />
      <circle cx={isHungry ? '63' : '58'} cy="83" r={isHungry ? '5' : '7'} fill={blush} opacity="0.8" />
      <circle cx={isHungry ? '120' : '129'} cy="83" r={isHungry ? '5' : '7'} fill={blush} opacity="0.8" />

      <ellipse
        cx={isHungry ? '92' : '93'}
        cy="87"
        rx={isHungry ? '16' : '20'}
        ry={isHungry ? '12' : '14'}
        fill={isRich ? '#f2a33a' : '#ffc0ca'}
        stroke={bodyDark}
        strokeWidth="4"
      />
      <circle cx={isHungry ? '86' : '86'} cy="86" r="2.5" fill="#7c2b34" />
      <circle cx={isHungry ? '99' : '100'} cy="86" r="2.5" fill="#7c2b34" />

      {isHungry ? (
        <path d="M81 102c6-7 17-7 23 0" fill="none" stroke="#50202a" strokeLinecap="round" strokeWidth="4" />
      ) : (
        <path
          d={isRich ? 'M75 99c10 14 27 14 38 0' : 'M80 100c8 9 21 9 29 0'}
          fill="none"
          stroke="#50202a"
          strokeLinecap="round"
          strokeWidth="4"
        />
      )}

      {isHungry && (
        <g aria-hidden="true" stroke="#b75c6d" strokeLinecap="round" strokeWidth="3" opacity="0.78">
          <path d="M58 59c7 4 13 4 20 0" />
          <path d="M56 74c7 4 13 4 20 0" />
          <path d="M111 57c8 4 14 4 22 0" />
          <path d="M113 73c7 4 13 4 20 0" />
        </g>
      )}

      <g aria-hidden="true" fill={bodyDark}>
        <rect x={isHungry ? '57' : '55'} y={isHungry ? '109' : '121'} width="13" height="15" rx="5" />
        <rect x={isHungry ? '111' : '118'} y={isHungry ? '109' : '121'} width="13" height="15" rx="5" />
      </g>

      {!isHungry && (
        <path
          d="M154 72c14 0 15-18 4-18-8 0-9 10-2 10"
          fill="none"
          stroke={bodyDark}
          strokeLinecap="round"
          strokeWidth="6"
        />
      )}
    </svg>
  )
}

function CoinStack({ x, y, count }: { x: number; y: number; count: number }) {
  return (
    <g aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => {
        const cy = y - index * 7
        return (
          <ellipse
            key={cy}
            cx={x}
            cy={cy}
            rx="16"
            ry="6"
            fill="#ffd967"
            stroke="#b98010"
            strokeWidth="3"
          />
        )
      })}
      <rect
        x={x - 16}
        y={y - (count - 1) * 7}
        width="32"
        height={(count - 1) * 7}
        fill="#f5b82f"
        opacity="0.72"
      />
    </g>
  )
}
