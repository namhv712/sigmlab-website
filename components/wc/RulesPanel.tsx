'use client'

import { useState } from 'react'

// Collapsible "Luật chơi" panel.
export default function RulesPanel() {
  const [open, setOpen] = useState(false)

  return (
    <div className="wc-panel overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <span className="text-base font-extrabold text-wc-gold">📜 Luật chơi</span>
        <span className="text-white/50">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <ul className="space-y-2 border-t border-white/10 px-5 py-4 text-sm leading-relaxed text-white/75">
          <li>⚽ Mỗi trận, bạn đoán kết quả <span className="font-semibold text-white">1X2</span>: Đội 1 thắng / Hòa / Đội 2 thắng.</li>
          <li>💸 Đoán <span className="font-semibold text-red-300">sai</span> bị phạt <span className="font-bold text-red-300">30.000đ</span>.</li>
          <li>🚫 <span className="font-semibold text-red-300">Không chọn</span> (bỏ trống) một trận bị phạt <span className="font-bold text-red-300">100.000đ</span>.</li>
          <li>✅ Đoán <span className="font-semibold text-emerald-300">đúng</span> thì <span className="font-bold text-emerald-300">không mất tiền</span> (0đ).</li>
          <li>🔒 Cược bị <span className="font-semibold text-white">khóa đúng lúc trận đấu bắt đầu</span> (bóng lăn) — sau đó không sửa được.</li>
          <li>🖐️ Khi chọn một phương án sẽ có <span className="font-semibold text-white">hộp xác nhận</span> trước khi lưu.</li>
          <li>⏰ Đăng ký muộn: tất cả các trận đã diễn ra trước đó <span className="font-semibold text-white">tính là &ldquo;không chọn&rdquo;</span> (phạt 100.000đ mỗi trận).</li>
          <li>🕖 Tất cả thời gian hiển thị theo <span className="font-semibold text-white">giờ Việt Nam (GMT+7)</span>.</li>
          <li>🏟️ Trận knock-out tính theo tỉ số chính thức (90 phút + hiệp phụ). Hòa rồi đá luân lưu vẫn tính là <span className="font-semibold text-white">Hòa (X)</span>.</li>
          <li>🏆 Bảng xếp hạng theo <span className="font-semibold text-wc-gold">tổng tiền</span>: ai mất ít tiền hơn xếp trên.</li>
        </ul>
      )}
    </div>
  )
}
