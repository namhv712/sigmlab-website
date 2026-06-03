'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import type { Match, Pick } from '@/lib/wcTypes'
import { vnDayKey } from '@/lib/wcTime'
import { getSchedule, getToken, getName, logout } from '@/lib/wcApi'
import { savePick } from '@/lib/wcApi'
import MatchCard from '@/components/wc/MatchCard'
import NowNextStrip from '@/components/wc/NowNextStrip'
import DateStrip from '@/components/wc/DateStrip'
import FilterChips, { type WcFilter } from '@/components/wc/FilterChips'
import LoginGate from '@/components/wc/LoginGate'
import RulesPanel from '@/components/wc/RulesPanel'

export default function WcPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [name, setNameState] = useState<string | null>(null)
  const [betting, setBetting] = useState(false)
  const [gateOpen, setGateOpen] = useState(false)
  const [savingId, setSavingId] = useState<string | null>(null)

  const [filter, setFilter] = useState<WcFilter>('all')
  const [day, setDay] = useState<string | null>(null)

  const mode = betting ? 'active' : 'view'

  const load = useCallback(async () => {
    try {
      const myName = getName()
      const data = await getSchedule(myName ?? undefined)
      setMatches(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được lịch thi đấu')
    } finally {
      setLoading(false)
    }
  }, [])

  // Read session on mount (SSR-safe), then load + poll every 60s.
  useEffect(() => {
    setBetting(!!getToken())
    setNameState(getName())
    load()
    const id = setInterval(load, 60_000)
    return () => clearInterval(id)
  }, [load])

  const onLoginSuccess = useCallback(
    (loggedName: string) => {
      setBetting(true)
      setNameState(loggedName)
      setGateOpen(false)
      load()
    },
    [load],
  )

  const onLogout = useCallback(() => {
    logout()
    setBetting(false)
    setNameState(null)
    load()
  }, [load])

  // Optimistic pick: update UI immediately, persist, revert on failure.
  const onPick = useCallback(
    async (match: Match, pick: Pick) => {
      const prev = match.myPick ?? null
      setSavingId(match.id)
      setMatches(ms => ms.map(m => (m.id === match.id ? { ...m, myPick: pick } : m)))
      try {
        await savePick(match.id, pick)
      } catch (err) {
        setMatches(ms => ms.map(m => (m.id === match.id ? { ...m, myPick: prev } : m)))
        setError(err instanceof Error ? err.message : 'Lưu cược thất bại')
      } finally {
        setSavingId(null)
      }
    },
    [],
  )

  const visible = useMemo(() => {
    return matches.filter(m => {
      if (day && vnDayKey(m.kickoff) !== day) return false
      if (filter === 'live' && m.status !== 'live') return false
      if (filter === 'upcoming' && m.status !== 'upcoming') return false
      if (filter === 'finished' && m.status !== 'finished') return false
      if (filter === 'mine' && !m.myPick) return false
      return true
    })
  }, [matches, day, filter])

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* Header */}
      <header className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          🏆 <span className="text-wc-gold">World Cup 2026</span>
        </h1>
        <p className="mt-1 text-sm text-white/60">
          Sảnh dự đoán của phòng lab SigM · 🇨🇦 🇲🇽 🇺🇸 · giờ Việt Nam (GMT+7)
        </p>
        <div className="mt-3 flex items-center justify-center gap-2">
          {betting ? (
            <>
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                Chế độ cược · {name}
              </span>
              <button
                onClick={onLogout}
                className="rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-white/60 hover:text-white"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/60">
                Chế độ xem
              </span>
              <button
                onClick={() => setGateOpen(true)}
                className="rounded-full bg-wc-gold px-3 py-1 text-xs font-extrabold text-[#0a0e1a] hover:opacity-90"
              >
                Đăng nhập để cược
              </button>
            </>
          )}
          <Link
            href="/wc/leaderboard"
            className="rounded-full border border-wc-gold/40 px-3 py-1 text-xs font-semibold text-wc-gold hover:bg-wc-gold/10"
          >
            🏅 Bảng xếp hạng
          </Link>
        </div>
      </header>

      {error && (
        <p className="mt-4 rounded-lg border border-red-500/30 bg-red-600/10 px-3 py-2 text-center text-xs text-red-300">
          {error}
        </p>
      )}

      <div className="mt-6 space-y-5">
        <NowNextStrip matches={matches} />

        <RulesPanel />

        <DateStrip matches={matches} selected={day} onSelect={setDay} />

        <FilterChips value={filter} onChange={setFilter} showMine={betting} />

        {loading ? (
          <div className="py-16 text-center text-sm text-white/40">Đang tải lịch thi đấu…</div>
        ) : visible.length === 0 ? (
          <div className="py-16 text-center text-sm text-white/40">
            Không có trận nào khớp bộ lọc.
          </div>
        ) : (
          <div className="space-y-3">
            {visible.map(m => (
              <MatchCard
                key={m.id}
                match={m}
                mode={mode}
                pending={savingId === m.id}
                onPick={pick => onPick(m, pick)}
              />
            ))}
          </div>
        )}
      </div>

      {gateOpen && (
        <LoginGate onClose={() => setGateOpen(false)} onSuccess={onLoginSuccess} />
      )}
    </div>
  )
}
