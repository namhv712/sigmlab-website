'use client'

import type { LeaderRow } from '@/lib/wcTypes'
import { dinoSummary, dinoTallyFromRows, dinoTier, type DinoTier } from '@/lib/wcDinos'

const DIALOGUES: Record<DinoTier, string[]> = {
  hungry: ['Grrr... đàn còn bé lắm!', 'Cho tôi thêm Raptor đi!'],
  herd: ['Đàn đông vui rồi đó!', 'T-Rex đang đi tuần quanh sân.'],
  legend: ['Kỷ Phấn Trắng trở lại!', 'Đàn này nghe tên đã thấy trang trọng.'],
}

export default function DinosaurFundTotal({ rows }: { rows: LeaderRow[] }) {
  const tally = dinoTallyFromRows(rows)
  const tier = dinoTier(tally.contribution)
  const label =
    tier === 'hungry'
      ? 'Khủng long đang đói'
      : tier === 'herd'
        ? 'Đàn khủng long hùng hậu'
        : 'Khủng long huyền thoại'

  return (
    <aside
      aria-label="Tổng đàn khủng long"
      className="relative z-40 w-[184px] sm:fixed sm:right-5 sm:top-20 sm:w-[230px]"
    >
      <div
        className="group relative rounded-2xl border border-wc-gold/35 bg-[rgba(8,12,24,0.82)] px-3 py-3 text-center shadow-2xl shadow-black/40 backdrop-blur-md outline-none transition hover:-translate-y-0.5 hover:border-wc-gold/70 focus-visible:border-wc-gold focus-visible:ring-2 focus-visible:ring-wc-gold/50"
        tabIndex={0}
      >
        <div className="pointer-events-none absolute right-0 top-full mt-2 w-56 rounded-2xl border border-white/15 bg-white px-3 py-2 text-left text-[11px] font-bold leading-snug text-slate-900 opacity-0 shadow-xl transition duration-200 group-hover:opacity-100 group-focus:opacity-100 sm:right-full sm:top-2 sm:mr-3 sm:mt-0">
          <span className="absolute -top-1 right-8 h-3 w-3 rotate-45 border-l border-t border-white/15 bg-white sm:-right-1 sm:top-4 sm:border-l-0 sm:border-r sm:border-t" />
          {DIALOGUES[tier].map((line) => (
            <span key={line} className="block">
              Khủng long: {line}
            </span>
          ))}
        </div>

        <DinosaurIllustration tier={tier} label={label} />

        <p className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-wc-gold/80">
          Tổng đàn
        </p>
        <p className="mt-0.5 text-sm font-black leading-tight text-white sm:text-base">
          {dinoSummary(tally)}
        </p>
      </div>
    </aside>
  )
}

function DinosaurIllustration({ tier, label }: { tier: DinoTier; label: string }) {
  const hungry = tier === 'hungry'
  const legend = tier === 'legend'
  const body = hungry ? '#8fbf7d' : legend ? '#e2b33b' : '#27b299'
  const bodyDark = hungry ? '#4f7c45' : legend ? '#946b12' : '#087967'
  const belly = hungry ? '#d8e2a4' : legend ? '#ffe08a' : '#a8ead8'
  const eye = '#101827'

  return (
    <svg
      aria-label={label}
      role="img"
      viewBox="0 0 240 180"
      className="mx-auto h-auto w-full"
    >
      <ellipse cx="124" cy="155" rx={hungry ? '72' : '88'} ry="11" fill="rgba(0,0,0,0.24)" />

      {legend && (
        <g aria-hidden="true">
          <circle cx="40" cy="138" r="12" fill="#f4f0d8" stroke="#a98b4c" strokeWidth="4" />
          <circle cx="200" cy="132" r="14" fill="#f4f0d8" stroke="#a98b4c" strokeWidth="4" />
          <path d="M65 134c10-19 33-22 45-5-14-5-28-3-45 5Z" fill="#f4f0d8" stroke="#a98b4c" strokeWidth="4" />
        </g>
      )}

      <path
        d={
          hungry
            ? 'M41 111c20-30 60-45 109-38 31 5 50 21 53 42 2 17-9 30-31 37-33 11-91 2-131-41Z'
            : 'M28 111c26-40 78-57 139-47 36 6 59 25 62 51 2 21-13 37-40 45-43 12-111 2-161-49Z'
        }
        fill={body}
        stroke={bodyDark}
        strokeWidth="6"
        strokeLinejoin="round"
      />

      <path
        d={hungry ? 'M157 80c16-33 31-49 47-48 20 2 22 25 5 36-12 8-25 8-39 22Z' : 'M165 76c19-42 38-60 59-58 25 2 27 31 6 45-15 10-31 10-49 27Z'}
        fill={body}
        stroke={bodyDark}
        strokeWidth="6"
        strokeLinejoin="round"
      />

      <path
        d={hungry ? 'M50 112 15 94c22-8 39-7 55 4Z' : 'M44 111 5 88c27-10 49-9 69 6Z'}
        fill={body}
        stroke={bodyDark}
        strokeWidth="6"
        strokeLinejoin="round"
      />

      <path
        d={hungry ? 'M72 124c28 13 62 15 96 5-17 15-71 18-96-5Z' : 'M61 124c38 18 82 19 126 4-23 22-93 24-126-4Z'}
        fill={belly}
        opacity="0.88"
      />

      <circle cx={hungry ? '195' : '213'} cy={hungry ? '48' : '40'} r="5" fill={eye} />
      <circle cx={hungry ? '197' : '215'} cy={hungry ? '46' : '38'} r="1.6" fill="#fff" />

      <path
        d={hungry ? 'M197 61c6 2 12 1 17-3' : 'M210 55c8 4 17 2 23-4'}
        fill="none"
        stroke={eye}
        strokeLinecap="round"
        strokeWidth="4"
      />

      <g aria-hidden="true" fill={bodyDark}>
        <rect x={hungry ? '81' : '77'} y={hungry ? '134' : '143'} width="17" height="25" rx="7" />
        <rect x={hungry ? '145' : '158'} y={hungry ? '134' : '143'} width="17" height="25" rx="7" />
      </g>

      <g aria-hidden="true" fill={legend ? '#ffe08a' : '#d7f4e9'} stroke={bodyDark} strokeLinejoin="round" strokeWidth="4">
        <path d="M76 69 85 47l10 25Z" />
        <path d="M108 62 118 39l11 26Z" />
        <path d="M141 64 152 43l9 25Z" />
      </g>

      {!hungry && (
        <g aria-hidden="true" fill="#f8fafc" stroke="#4b5563" strokeWidth="3">
          <path d="M209 63l8 2-6 5Z" />
          <path d="M222 58l8 1-5 6Z" />
        </g>
      )}
    </svg>
  )
}
