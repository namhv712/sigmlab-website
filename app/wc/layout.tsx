import type { Metadata } from 'next'
import './wc-theme.css'

export const metadata: Metadata = {
  title: 'World Cup 2026 · SigM Lab',
  description:
    'Dự đoán kết quả World Cup 2026 cùng phòng lab SigM — đoán 1X2 mỗi trận, ghi điểm và tranh tài trên bảng xếp hạng. Giờ Việt Nam (GMT+7).',
}

export default function WcLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="wc-root">
      <div className="wc-host-bar" />
      {children}
    </div>
  )
}
