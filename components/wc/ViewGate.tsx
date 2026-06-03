'use client'

import { useEffect, useState } from 'react'

// Single shared password to VIEW the World Cup tab at all (separate from the
// per-user betting login). Static export → this is a casual client-side gate:
// it hides the UI, not the underlying API. Good enough for a lab pool.
const VIEW_KEY = 'wc_view_ok'
const VIEW_PASS = '12345654321'

export default function ViewGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false)
  const [ready, setReady] = useState(false)
  const [pass, setPass] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Read unlock flag after mount (SSR-safe). Until ready, render nothing so
  // returning users never see a flash of the password screen.
  useEffect(() => {
    try {
      if (window.localStorage.getItem(VIEW_KEY) === '1') setUnlocked(true)
    } catch {
      /* ignore */
    }
    setReady(true)
  }, [])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (pass.trim() === VIEW_PASS) {
      try {
        window.localStorage.setItem(VIEW_KEY, '1')
      } catch {
        /* ignore */
      }
      setUnlocked(true)
      setError(null)
    } else {
      setError('Mật khẩu không đúng')
    }
  }

  if (!ready) return null
  if (unlocked) return <>{children}</>

  return (
    <div className="grid min-h-[70vh] place-items-center px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-wc-gold/30 bg-[#0d1428] p-6 shadow-2xl"
      >
        <h1 className="text-center text-2xl font-extrabold text-wc-gold">
          🏆 World Cup 2026
        </h1>
        <p className="mt-1 text-center text-xs text-white/50">
          Nhập mật khẩu chung của phòng lab để xem sảnh dự đoán.
        </p>

        <label className="mt-5 block text-xs font-semibold text-white/70">Mật khẩu</label>
        <input
          type="password"
          value={pass}
          onChange={e => setPass(e.target.value)}
          placeholder="Mật khẩu chung"
          autoFocus
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-wc-gold focus:outline-none"
        />

        {error && <p className="mt-3 text-xs font-semibold text-red-400">{error}</p>}

        <button
          type="submit"
          className="mt-5 w-full rounded-lg bg-wc-gold px-4 py-2.5 text-sm font-extrabold text-[#0a0e1a] transition-opacity hover:opacity-90"
        >
          Vào xem
        </button>
      </form>
    </div>
  )
}
