// Builds the line shown in the pick-confirmation dialog. Per open it randomly
// returns EITHER a playful penalty reminder ('fun') OR a "stat" ('stat') that
// sounds like authoritative match analysis but blends a REAL anchor (nickname /
// FIFA rank / star player, from wcTeamFacts) with FABRICATED numbers and a quiet
// undercut — so the bettor genuinely can't tell what's true. Pure client-side;
// randomized once per dialog mount via useMemo in ConfirmPick.

import type { Match, Pick } from './wcTypes'
import { getFact, type TeamFact } from './wcTeamFacts'

export type Highlight =
  | { kind: 'fun'; text: string }
  | { kind: 'stat'; text: string }

// Playful lines reminding the bettor a wrong guess adds one Raptor.
export const FUN_LINES = [
  'Sai là nhận thêm 1 Raptor đó nha, suy nghĩ kỹ chưa? 🦖',
  'Chốt kèo này, lỡ sai thì Raptor theo về tận lab!',
  'Tự tin chưa? Đoán trật là chuồng khủng long đông thêm đó.',
  'Kèo này mà sai thì Raptor gõ cửa liền nhé.',
  'Trật là thêm một bé Raptor, cũng oai mà hơi đau.',
  'Đoán sai = nuôi đàn khủng long của lab thêm 1 Raptor.',
  'Tay nhanh hơn não là Raptor chạy vào bảng xếp hạng đấy sếp ơi.',
  'Chốt đi! Sai thì tên bạn có cơ hội trông trang trọng hơn.',
  'Lỡ sai thêm 1 Raptor, nhưng bỏ trống còn gọi hẳn T-Rex về!',
  'Kèo thơm hay kèo thúi? Đoán trật là Raptor xuất hiện.',
  'Hên xui đoán bừa, gãy kèo là khủng long tăng dân số.',
  'Chốt cho máu! Sai thì chuồng Raptor có thêm thành viên.',
]

const ri = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1))
const rf = (min: number, max: number, dp = 1) => (min + Math.random() * (max - min)).toFixed(dp)
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

// Stat templates for a decisive pick (chosen team C with fact cf, opponent O with of).
const SIDE_TEMPLATES: ((C: string, O: string, cf: TeamFact, of: TeamFact) => string)[] = [
  (C, O, cf) =>
    `📊 ${C} (${cf.nick}) thắng ${ri(54, 73)}% trong ${ri(9, 17)} lần gặp ${O} gần đây — nhưng đa số là giao hữu.`,
  (C, O) =>
    `🧠 Chỉ số ELO: ${C} ${ri(1740, 1900)} vs ${O} ${ri(1650, 1840)} — nhưng ${O} thắng ${ri(3, 4)}/5 lần chạm trán mới nhất (nguồn nội bộ).`,
  (C, _O, cf) =>
    `⚽ ${cf.star} đang phong độ cao: ${ri(7, 14)} bàn… tính cả mùa giải 2019.`,
  (C, O, cf, of) =>
    `🏆 ${C} hạng ${cf.rank} FIFA, ${O} hạng ${of.rank} — chênh ${Math.abs(cf.rank - of.rank)} bậc, nhưng bóng đá mà, ai biết được.`,
  (C, O) =>
    `🔢 xG mùa này: ${C} ${rf(1.3, 2.1)} vs ${O} ${rf(0.7, 1.5)} — sát nút lắm, thắng thua trong gang tấc (hoặc không).`,
  (C) =>
    `💹 Nhà cái treo ${C} ${rf(1.65, 2.4, 2)}; ${ri(62, 88)}% chuyên gia chọn giống bạn (cỡ mẫu: 3 người trong lab).`,
  (C, _O, cf) =>
    `🩺 ${cf.star} nghe đồn dính cảm nhẹ tuần này (${ri(20, 80)}% ra sân) — mà tin này tôi tự bịa thôi.`,
  (C, O, _cf, of) =>
    `📈 ${C} bất bại ${ri(4, 9)} trận gần nhất trước các đội ${of.conf}; ${O} cũng y chang. Cấn nhau rồi.`,
  (C, _O, cf) =>
    `🌡️ Chỉ số phong thủy hôm nay nghiêng về ${cf.nick}: ${ri(3, 5)}/5 sao ⭐ — cực kỳ khoa học.`,
  (C) =>
    `🧮 Tổng hợp 4 mô hình AI: ${ri(2, 3)} mô hình ủng hộ ${C}, số còn lại đang… bảo trì.`,
]

// Stat templates for a draw pick (teams A and B with facts fa, fb).
const DRAW_TEMPLATES: ((A: string, B: string, fa: TeamFact, fb: TeamFact) => string)[] = [
  (A, B) =>
    `🤝 ${ri(58, 79)}% mô hình dự báo Hòa ${A} - ${B}… mấy mô hình còn lại dự báo trời mưa.`,
  (A, B) =>
    `📊 ${A} vs ${B}: ${ri(7, 12)} lần gần nhất có ${ri(2, 4)} trận hòa — kèo Hòa "có cơ sở" (cơ sở hơi mỏng).`,
  () =>
    `🧠 ELO hai đội chênh ${ri(5, 40)} điểm — gần như chắc chắn Hòa, hoặc là một đội thắng.`,
  () =>
    `💹 Kèo Hòa trả ${rf(2.9, 3.6, 2)} — cao nhất bàn, nhưng cao thường có lý do của nó đó nha.`,
  (_A, _B, fa, fb) =>
    `⚖️ ${fa.star} vs ${fb.star}: cân tài cân sức, nên ${ri(40, 70)}% khả năng hòa (phần trăm này tôi đoán).`,
]

export function makeHighlight(match: Match, p: Pick): Highlight {
  const f1 = getFact(match.team1)
  const f2 = getFact(match.team2)

  // Only build a believable match stat when BOTH teams are real (not knockout
  // placeholders). Otherwise — and ~half the time anyway — show a funny line.
  const canStat = !!f1 && !!f2
  if (!canStat || Math.random() < 0.5) {
    return { kind: 'fun', text: pick(FUN_LINES) }
  }

  if (p === 'X') {
    return { kind: 'stat', text: pick(DRAW_TEMPLATES)(match.team1, match.team2, f1!, f2!) }
  }

  const chosen = p === '1' ? match.team1 : match.team2
  const other = p === '1' ? match.team2 : match.team1
  const cf = p === '1' ? f1! : f2!
  const of = p === '1' ? f2! : f1!
  return { kind: 'stat', text: pick(SIDE_TEMPLATES)(chosen, other, cf, of) }
}
