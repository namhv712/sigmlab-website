'use client'

import { useEffect, useState } from 'react'
import { getAllFollows } from '@/lib/wcApi'
import type { CopyLink } from '@/lib/wcTypes'

// Public "who is copying who" board. Shows every copy relationship LEVEL BY
// LEVEL — one row per direct edge (A→B, B→C as separate rows), never flattened
// into a compound chain. It's deliberately a bit cheeky so the person being
// copied notices and joins the fun.
const VERBS = [
  'đang chép bài',
  'đang đu càng',
  'bám đuôi',
  'nhái y chang',
  'rình copy',
  'photocopy cược của',
]

// Deterministic verb per pair so a relationship keeps the same wording between
// polls (no flicker) without needing Math.random.
function verbFor(follower: string, target: string): string {
  const s = `${follower}→${target}`
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return VERBS[h % VERBS.length]
}

export default function CopyRelations({ version = 0 }: { version?: number }) {
  const [links, setLinks] = useState<CopyLink[] | null>(null)

  useEffect(() => {
    let alive = true
    const load = () =>
      getAllFollows()
        .then((l) => alive && setLinks(l))
        .catch(() => {})
    load()
    const id = setInterval(load, 20_000)
    return () => {
      alive = false
      clearInterval(id)
    }
  }, [version])

  if (!links) return null

  return (
    <section className="rounded-2xl border border-wc-gold/25 bg-[rgba(10,14,26,0.6)] p-4">
      <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-wc-gold">
        🐑 Ai đang copy ai
      </h2>

      {links.length === 0 ? (
        <p className="mt-2 text-sm text-white/55">
          Chưa ai dám chép bài ai cả — ai sẽ là “thợ săn phao” đầu tiên? 🐔
        </p>
      ) : (
        <ul className="mt-2.5 space-y-1.5">
          {links.map((l) => (
            <li
              key={`${l.follower}→${l.target}`}
              className="flex flex-wrap items-center gap-x-1.5 text-sm text-white/80"
            >
              <span className="font-bold text-white">{l.follower}</span>
              <span className="text-white/55">{verbFor(l.follower, l.target)}</span>
              <span className="font-bold text-wc-gold">{l.target}</span>
              <span aria-hidden="true">📋</span>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-3 text-[11px] leading-snug text-white/40">
        Copy theo dây chuyền: nếu B chép C, thì người chép B cũng tự động ăn theo C
        luôn. B đổi sang chép D thì cả dây cũng quay sang D. 😎
      </p>
    </section>
  )
}
