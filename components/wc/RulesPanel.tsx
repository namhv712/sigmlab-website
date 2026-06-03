'use client'

import { useState } from 'react'

// Collapsible "Luật chơi" panel.
export default function RulesPanel() {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04]">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-sm font-bold text-wc-gold">📜 Luật chơi</span>
        <span className="text-white/50">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <ul className="space-y-1.5 border-t border-white/10 px-5 py-3 text-xs text-white/70">
          <li>• Mỗi trận, bạn đoán kết quả <span className="font-semibold text-white">1X2</span>: Đội 1 thắng / Hòa / Đội 2 thắng.</li>
          <li>• Đoán đúng được <span className="font-semibold text-wc-gold">+3 điểm</span>. Đoán sai 0 điểm.</li>
          <li>• Cược bị <span className="font-semibold text-white">khóa khi bóng lăn</span> (đúng giờ khai cuộc).</li>
          <li>• Tất cả thời gian hiển thị theo <span className="font-semibold text-white">giờ Việt Nam (GMT+7)</span>.</li>
          <li>• Trận knock-out tính theo tỉ số chính thức (90 phút + hiệp phụ). Hòa rồi đá luân lưu vẫn tính là <span className="font-semibold text-white">Hòa (X)</span>.</li>
          <li>• Bảng xếp hạng: nhiều điểm hơn xếp trên; bằng điểm thì xét số lần đoán đúng.</li>
        </ul>
      )}
    </div>
  )
}
