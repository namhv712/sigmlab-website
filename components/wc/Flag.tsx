// Maps a team name to a flag emoji. Falls back to ⚽ for placeholders
// (e.g. knockout codes like "W101", "1A") and unknown nations.

const FLAGS: Record<string, string> = {
  // Hosts 2026
  Canada: '🇨🇦',
  Mexico: '🇲🇽',
  'United States': '🇺🇸',
  USA: '🇺🇸',
  // Likely / historic WC nations
  Argentina: '🇦🇷',
  Australia: '🇦🇺',
  Austria: '🇦🇹',
  Belgium: '🇧🇪',
  Brazil: '🇧🇷',
  Cameroon: '🇨🇲',
  Chile: '🇨🇱',
  Colombia: '🇨🇴',
  'Costa Rica': '🇨🇷',
  Croatia: '🇭🇷',
  Denmark: '🇩🇰',
  Ecuador: '🇪🇨',
  Egypt: '🇪🇬',
  England: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  France: '🇫🇷',
  Germany: '🇩🇪',
  Ghana: '🇬🇭',
  Greece: '🇬🇷',
  Iran: '🇮🇷',
  'IR Iran': '🇮🇷',
  Italy: '🇮🇹',
  'Ivory Coast': '🇨🇮',
  "Côte d'Ivoire": '🇨🇮',
  Japan: '🇯🇵',
  'South Korea': '🇰🇷',
  'Korea Republic': '🇰🇷',
  Morocco: '🇲🇦',
  Netherlands: '🇳🇱',
  'New Zealand': '🇳🇿',
  Nigeria: '🇳🇬',
  Norway: '🇳🇴',
  Panama: '🇵🇦',
  Paraguay: '🇵🇾',
  Peru: '🇵🇪',
  Poland: '🇵🇱',
  Portugal: '🇵🇹',
  Qatar: '🇶🇦',
  'Saudi Arabia': '🇸🇦',
  Senegal: '🇸🇳',
  Serbia: '🇷🇸',
  Spain: '🇪🇸',
  Sweden: '🇸🇪',
  Switzerland: '🇨🇭',
  Tunisia: '🇹🇳',
  Turkey: '🇹🇷',
  'Türkiye': '🇹🇷',
  Ukraine: '🇺🇦',
  Uruguay: '🇺🇾',
  Wales: '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
  // Vietnam-relevant / AFC
  Vietnam: '🇻🇳',
  'Viet Nam': '🇻🇳',
  Thailand: '🇹🇭',
  Indonesia: '🇮🇩',
  Algeria: '🇩🇿',
  'South Africa': '🇿🇦',
  Jordan: '🇯🇴',
  Uzbekistan: '🇺🇿',
  'Cape Verde': '🇨🇻',
  Jamaica: '🇯🇲',
  Honduras: '🇭🇳',
}

export function flagFor(team: string): string {
  return FLAGS[team?.trim()] || '⚽'
}

export default function Flag({ team, className }: { team: string; className?: string }) {
  return (
    <span className={className} aria-hidden="true">
      {flagFor(team)}
    </span>
  )
}
