'use client'

import { useState } from 'react'
import { changePassword } from '@/lib/wcApi'

function messageFor(code: string): string {
  switch (code) {
    case 'bad_current_password':
      return 'Mật khẩu hiện tại không đúng.'
    case 'bad_request':
      return 'Mật khẩu mới tối thiểu 4 ký tự.'
    case 'rate_limited':
      return 'Thử lại sau ít phút.'
    case 'unauthorized':
      return 'Phiên đăng nhập đã hết hạn.'
    default:
      return 'Có lỗi xảy ra, thử lại.'
  }
}

export default function ChangePasswordDialog({
  onClose,
  onSuccess,
}: {
  onClose: () => void
  onSuccess: () => void
}) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!currentPassword) {
      setError('Nhập mật khẩu hiện tại.')
      return
    }
    if (newPassword.length < 4) {
      setError('Mật khẩu mới tối thiểu 4 ký tự.')
      return
    }
    if (newPassword !== confirm) {
      setError('Mật khẩu nhập lại không khớp.')
      return
    }

    setBusy(true)
    try {
      await changePassword(currentPassword, newPassword)
      onSuccess()
    } catch (err) {
      setError(messageFor(err instanceof Error ? err.message : ''))
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
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-wc-gold/30 bg-[#0d1428] p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-wc-gold">Đổi mật khẩu</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-white/40 hover:text-white"
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        <label className="mt-4 block text-xs font-semibold text-white/70">
          Mật khẩu hiện tại
        </label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          autoFocus
          autoComplete="current-password"
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-wc-gold focus:outline-none"
        />

        <label className="mt-3 block text-xs font-semibold text-white/70">Mật khẩu mới</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-wc-gold focus:outline-none"
        />

        <label className="mt-3 block text-xs font-semibold text-white/70">
          Nhập lại mật khẩu mới
        </label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-wc-gold focus:outline-none"
        />

        {error && <p className="mt-3 text-xs font-semibold text-red-400">{error}</p>}

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-white/15 px-4 py-2.5 text-sm font-bold text-white/70 hover:text-white"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={busy}
            className="flex-1 rounded-lg bg-wc-gold px-4 py-2.5 text-sm font-extrabold text-[#0a0e1a] transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {busy ? 'Đang lưu…' : 'Lưu'}
          </button>
        </div>
      </form>
    </div>
  )
}
