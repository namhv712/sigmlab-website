'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import type { LeaderRow } from '@/lib/wcTypes'
import { getLeaderboard, getName } from '@/lib/wcApi'
import LeaderboardTable from '@/components/wc/LeaderboardTable'

export default function WcLeaderboardPage() {
  const [rows, setRows] = useState<LeaderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [me, setMe] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const data = await getLeaderboard()
      setRows(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được bảng xếp hạng')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setMe(getName())
    load()
    const id = setInterval(load, 60_000)
    return () => clearInterval(id)
  }, [load])

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <header className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          🏅 <span className="text-wc-gold">Bảng xếp hạng</span>
        </h1>
        <p className="mt-1 text-sm text-white/60">World Cup 2026 · phòng lab SigM</p>
        <div className="mt-3">
          <Link
            href="/wc"
            className="rounded-full border border-wc-gold/40 px-3 py-1 text-xs font-semibold text-wc-gold hover:bg-wc-gold/10"
          >
            ← Về lịch thi đấu
          </Link>
        </div>
      </header>

      {error && (
        <p className="mt-4 rounded-lg border border-red-500/30 bg-red-600/10 px-3 py-2 text-center text-xs text-red-300">
          {error}
        </p>
      )}

      <div className="mt-6">
        {loading ? (
          <div className="py-16 text-center text-sm text-white/40">Đang tải…</div>
        ) : (
          <LeaderboardTable rows={rows} highlight={me} />
        )}
      </div>
    </div>
  )
}
