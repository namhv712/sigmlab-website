'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import type { Match, Pick } from '@/lib/wcTypes'
import { vnDayKey } from '@/lib/wcTime'
import { getSchedule, getToken, getName, logout, getLeaderboard, getDinoSeen, setDinoSeen } from '@/lib/wcApi'
import { savePick } from '@/lib/wcApi'
import { dinoTallyFromRow, dinoCelebration, type DinoCelebration as DinoCelebrationData } from '@/lib/wcDinos'
import DinoCelebration from '@/components/wc/DinoCelebration'
import MatchCard from '@/components/wc/MatchCard'
import NowNextStrip from '@/components/wc/NowNextStrip'
import DateStrip from '@/components/wc/DateStrip'
import FilterChips, { type WcFilter } from '@/components/wc/FilterChips'
import LoginGate from '@/components/wc/LoginGate'
import RulesPanel from '@/components/wc/RulesPanel'
import WcBanner from '@/components/wc/WcBanner'
import MoneySummary from '@/components/wc/MoneySummary'
import ConfirmPick from '@/components/wc/ConfirmPick'
import CopyControl from '@/components/wc/CopyControl'
import CopyRelations from '@/components/wc/CopyRelations'

export default function WcPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [name, setNameState] = useState<string | null>(null)
  const [betting, setBetting] = useState(false)
  const [gateOpen, setGateOpen] = useState(false)
  const [savingId, setSavingId] = useState<string | null>(null)

  // Pending pick awaiting confirmation in the dialog.
  const [confirm, setConfirm] = useState<{ match: Match; pick: Pick } | null>(null)

  const [filter, setFilter] = useState<WcFilter>('all')
  const [day, setDay] = useState<string | null>(null)

  // Bumped whenever a follow changes so the public copy board refreshes at once.
  const [copyTick, setCopyTick] = useState(0)

  // Login celebration: shown when the member's dino herd has grown since last seen.
  const [celebration, setCelebration] = useState<DinoCelebrationData | null>(null)

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

  // Compare the member's current herd against the last total we celebrated and,
  // if it grew, pop the fireworks. Always persist the new total so each herd is
  // celebrated once. Best-effort: leaderboard hiccups never block the page.
  const checkDinoGrowth = useCallback(async (memberName: string) => {
    try {
      const rows = await getLeaderboard()
      const row = rows.find((r) => r.name === memberName)
      // No matching row (e.g. name normalised server-side) → leave the stored
      // baseline untouched so we never reset it to 0 and re-celebrate the whole
      // herd on the next login.
      if (!row) return
      const tally = dinoTallyFromRow(row)
      const cel = dinoCelebration(tally, getDinoSeen(memberName))
      setDinoSeen(memberName, tally.total)
      if (cel) setCelebration(cel)
    } catch {
      /* ignore — celebration is non-critical */
    }
  }, [])

  // Read session on mount (SSR-safe), then load + poll every 60s. A returning
  // logged-in member also gets a celebration if their herd grew while away.
  useEffect(() => {
    setBetting(!!getToken())
    const savedName = getName()
    setNameState(savedName)
    load()
    if (getToken() && savedName) checkDinoGrowth(savedName)
    const id = setInterval(load, 60_000)
    return () => clearInterval(id)
  }, [load, checkDinoGrowth])

  const onLoginSuccess = useCallback(
    (loggedName: string) => {
      setBetting(true)
      setNameState(loggedName)
      setGateOpen(false)
      load()
      checkDinoGrowth(loggedName)
    },
    [load, checkDinoGrowth],
  )

  const onLogout = useCallback(() => {
    logout()
    setBetting(false)
    setNameState(null)
    load()
  }, [load])

  // Clicking an option opens the confirmation dialog (no save yet).
  const requestPick = useCallback((match: Match, pick: Pick) => {
    setConfirm({ match, pick })
  }, [])

  // Optimistic commit after the user confirms: update UI, persist, revert on fail.
  const commitPick = useCallback(async () => {
    if (!confirm) return
    const { match, pick } = confirm
    const prev = match.myPick ?? null
    setSavingId(match.id)
    setMatches(ms => ms.map(m => (m.id === match.id ? { ...m, myPick: pick } : m)))
    try {
      await savePick(match.id, pick)
      setConfirm(null)
    } catch (err) {
      setMatches(ms => ms.map(m => (m.id === match.id ? { ...m, myPick: prev } : m)))
      setError(err instanceof Error ? err.message : 'Lưu cược thất bại')
      setConfirm(null)
    } finally {
      setSavingId(null)
    }
  }, [confirm])

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
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Hero banner */}
      <WcBanner priority />

      {/* Header */}
      <header className="mt-6 text-center">
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
          <span className="wc-gradient-text">World Cup 2026</span>
        </h1>
        <p className="mt-2 text-sm text-white/60 sm:text-base">
          Sảnh dự đoán của phòng lab SigM · 🇨🇦 🇲🇽 🇺🇸 · giờ Việt Nam (GMT+7)
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {betting ? (
            <>
              <span className="rounded-full bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                Chế độ cược · {name}
              </span>
              {name && (
                <CopyControl
                  name={name}
                  onChanged={() => {
                    load()
                    setCopyTick((t) => t + 1)
                  }}
                />
              )}
              <button
                onClick={onLogout}
                className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-white/60 hover:text-white"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/60">
                Chế độ xem
              </span>
              <button
                onClick={() => setGateOpen(true)}
                className="rounded-full bg-gradient-to-b from-[#ffd95e] to-wc-gold px-4 py-1.5 text-xs font-extrabold text-[#0a0e1a] shadow-lg shadow-wc-gold/30 hover:brightness-105"
              >
                Đăng nhập để cược
              </button>
            </>
          )}
          <Link
            href="/wc/leaderboard"
            className="rounded-full border border-wc-gold/40 px-3 py-1.5 text-xs font-semibold text-wc-gold hover:bg-wc-gold/10"
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
        {betting && name && <MoneySummary matches={matches} name={name} />}

        <NowNextStrip matches={matches} />

        <CopyRelations version={copyTick} />

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
          <div className="space-y-3.5">
            {visible.map(m => (
              <MatchCard
                key={m.id}
                match={m}
                mode={mode}
                pending={savingId === m.id}
                onPick={pick => requestPick(m, pick)}
              />
            ))}
          </div>
        )}
      </div>

      {confirm && (
        <ConfirmPick
          match={confirm.match}
          pick={confirm.pick}
          pending={savingId === confirm.match.id}
          onConfirm={commitPick}
          onCancel={() => setConfirm(null)}
        />
      )}

      {gateOpen && (
        <LoginGate onClose={() => setGateOpen(false)} onSuccess={onLoginSuccess} />
      )}

      {celebration && (
        <DinoCelebration data={celebration} onClose={() => setCelebration(null)} />
      )}
    </div>
  )
}
