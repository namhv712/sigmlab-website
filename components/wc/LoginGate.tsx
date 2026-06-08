'use client'

import { useState } from 'react'
import { login, register } from '@/lib/wcApi'

type Mode = 'login' | 'register'

// Map the stable error codes thrown by wcApi to Vietnamese UI strings.
function messageFor(code: string): string {
  switch (code) {
    case 'name_taken':
      return 'Tên này đã có người dùng — chọn tên khác hoặc đăng nhập.'
    case 'bad_login':
      return 'Sai tên hoặc mật khẩu.'
    case 'bad_request':
      return 'Mật khẩu tối thiểu 4 ký tự.'
    case 'rate_limited':
      return 'Thử lại sau ít phút.'
    default:
      return 'Có lỗi xảy ra, thử lại.'
  }
}

// Modal: register a personal password or log in → unlock betting mode.
export default function LoginGate({
  onClose,
  onSuccess,
}: {
  onClose: () => void
  onSuccess: (name: string) => void
}) {
  const [mode, setMode] = useState<Mode>('login')
  const [name, setName] = useState('')
  const [passcode, setPasscode] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  function switchMode(next: Mode) {
    setMode(next)
    setError(null)
    setConfirm('')
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Vui lòng nhập tên hiển thị')
      return
    }
    if (mode === 'register') {
      if (passcode.length < 4) {
        setError('Mật khẩu tối thiểu 4 ký tự.')
        return
      }
      if (passcode !== confirm) {
        setError('Mật khẩu nhập lại không khớp.')
        return
      }
    }
    setBusy(true)
    try {
      if (mode === 'register') await register(trimmed, passcode)
      else await login(trimmed, passcode)
      onSuccess(trimmed)
    } catch (err) {
      setError(messageFor(err instanceof Error ? err.message : ''))
    } finally {
      setBusy(false)
    }
  }

  const tabBase =
    'flex-1 rounded-lg px-3 py-2 text-sm font-bold transition-colors'
  const tabOn = 'bg-wc-gold text-[#0a0e1a]'
  const tabOff = 'text-white/60 hover:text-white'

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
          <h2 className="text-lg font-extrabold text-wc-gold">⚽ Cược World Cup</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-white/40 hover:text-white"
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 flex gap-1 rounded-xl bg-white/5 p-1">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`${tabBase} ${mode === 'login' ? tabOn : tabOff}`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => switchMode('register')}
            className={`${tabBase} ${mode === 'register' ? tabOn : tabOff}`}
          >
            Đăng ký
          </button>
        </div>

        <p className="mt-3 text-xs text-white/50">
          {mode === 'register'
            ? 'Chọn tên hiển thị và tự đặt mật khẩu riêng của bạn.'
            : 'Nhập tên hiển thị và mật khẩu bạn đã đăng ký.'}
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
          placeholder={mode === 'register' ? 'Tối thiểu 4 ký tự' : 'Mật khẩu của bạn'}
          autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-wc-gold focus:outline-none"
        />

        {mode === 'register' && (
          <>
            <label className="mt-3 block text-xs font-semibold text-white/70">
              Nhập lại mật khẩu
            </label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Nhập lại mật khẩu"
              autoComplete="new-password"
              className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-wc-gold focus:outline-none"
            />
          </>
        )}

        {error && <p className="mt-3 text-xs font-semibold text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="mt-5 w-full rounded-lg bg-wc-gold px-4 py-2.5 text-sm font-extrabold text-[#0a0e1a] transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {busy
            ? 'Đang xử lý…'
            : mode === 'register'
              ? 'Đăng ký & vào cược'
              : 'Vào cược'}
        </button>

        {mode === 'login' && (
          <p className="mt-3 text-center text-[11px] text-white/40">
            Quên mật khẩu? Nhờ quản trị phòng lab đặt lại.
          </p>
        )}
      </form>
    </div>
  )
}
