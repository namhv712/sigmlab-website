'use client'

import { useState } from 'react'
import { login } from '@/lib/wcApi'

// Modal: enter display name + shared passcode → login → unlock betting mode.
export default function LoginGate({
  onClose,
  onSuccess,
}: {
  onClose: () => void
  onSuccess: (name: string) => void
}) {
  const [name, setName] = useState('')
  const [passcode, setPasscode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Vui lòng nhập tên hiển thị')
      return
    }
    setBusy(true)
    try {
      await login(trimmed, passcode)
      onSuccess(trimmed)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <form
        onClick={e => e.stopPropagation()}
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-wc-gold/30 bg-[#0d1428] p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-wc-gold">⚽ Đăng nhập để cược</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-white/40 hover:text-white"
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>
        <p className="mt-1 text-xs text-white/50">
          Chọn tên hiển thị và nhập mật khẩu chung của phòng lab.
        </p>

        <label className="mt-4 block text-xs font-semibold text-white/70">Tên hiển thị</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Ví dụ: Nam"
          autoFocus
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-wc-gold focus:outline-none"
        />

        <label className="mt-3 block text-xs font-semibold text-white/70">Mật khẩu</label>
        <input
          type="password"
          value={passcode}
          onChange={e => setPasscode(e.target.value)}
          placeholder="Mật khẩu chung"
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-wc-gold focus:outline-none"
        />

        {error && <p className="mt-3 text-xs font-semibold text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="mt-5 w-full rounded-lg bg-wc-gold px-4 py-2.5 text-sm font-extrabold text-[#0a0e1a] transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {busy ? 'Đang đăng nhập…' : 'Vào cược'}
        </button>
      </form>
    </div>
  )
}
