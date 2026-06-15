'use client'

import { useEffect, useState } from 'react'
import { getFollow, follow, unfollow, getLeaderboard } from '@/lib/wcApi'

// "📋 Copy cược" control shown in bet mode. Lets a member follow another
// member to auto-copy their FUTURE picks (blind — values stay hidden until
// kickoff). Following someone new replaces the old target. `onChanged` reloads
// the schedule so copied/uncovered markers refresh.
export default function CopyControl({
  name,
  onChanged,
}: {
  name: string
  onChanged: () => void
}) {
  const [following, setFollowing] = useState<string | null>(null)
  const [members, setMembers] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    getFollow()
      .then(f => alive && setFollowing(f))
      .catch(() => {})
    getLeaderboard()
      .then(rows => alive && setMembers(rows.map(r => r.name).filter(n => n !== name)))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [name])

  const onFollow = async (target: string) => {
    setBusy(true)
    setError(null)
    try {
      const { following: f } = await follow(target)
      setFollowing(f)
      setOpen(false)
      onChanged()
    } catch (e) {
      const code = e instanceof Error ? e.message : ''
      setError(
        code === 'unknown_user'
          ? 'Không tìm thấy người này'
          : code === 'rate_limited'
            ? 'Thử lại sau giây lát'
            : 'Không copy được',
      )
    } finally {
      setBusy(false)
    }
  }

  const onUnfollow = async () => {
    setBusy(true)
    setError(null)
    try {
      await unfollow()
      setFollowing(null)
      onChanged()
    } catch {
      setError('Không huỷ được')
    } finally {
      setBusy(false)
    }
  }

  if (following) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-wc-gold/15 px-3 py-1.5 text-xs font-semibold text-wc-gold">
        📋 Bạn đang copy: {following}
        <button
          onClick={onUnfollow}
          disabled={busy}
          title="Huỷ copy"
          className="ml-0.5 rounded-full px-1 text-wc-gold/70 hover:text-white disabled:opacity-50"
        >
          ✕
        </button>
      </span>
    )
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(o => !o)}
        disabled={busy}
        className="rounded-full border border-wc-gold/40 px-3 py-1.5 text-xs font-semibold text-wc-gold hover:bg-wc-gold/10 disabled:opacity-50"
      >
        📋 Copy cược của…
      </button>

      {open && (
        <div className="absolute left-1/2 z-20 mt-2 max-h-64 w-56 -translate-x-1/2 overflow-auto rounded-xl border border-white/15 bg-[#0a0e1a] p-1.5 text-left shadow-2xl">
          {error && <p className="px-2 py-1 text-[11px] text-red-300">{error}</p>}
          <p className="px-2 py-1 text-[11px] text-white/40">
            Tự động copy các lựa chọn sắp tới (ẩn cho tới giờ bóng lăn)
          </p>
          {members.length === 0 ? (
            <p className="px-2 py-2 text-xs text-white/40">Chưa có thành viên nào khác</p>
          ) : (
            members.map(m => (
              <button
                key={m}
                onClick={() => onFollow(m)}
                disabled={busy}
                className="block w-full truncate rounded-lg px-2.5 py-1.5 text-left text-sm text-white/80 hover:bg-white/10 hover:text-wc-gold disabled:opacity-50"
              >
                {m}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
