// Real-ish anchors for the 48 group-stage nations, keyed by the EXACT team name
// used in the schedule (openfootball). These genuine facts (nickname, FIFA rank,
// star player, confederation) are what make the "misleading stats" in the pick
// dialog sound credible — wcStats.ts wraps them in fabricated numbers. Knockout
// slots (1A, W73, 3A/B/C/D/F, …) are absent on purpose → those fall back to a
// funny line. Ranks ≈ June 2026 FIFA / power-ranking range; close enough to feel
// real for a betting-pool gag.

export interface TeamFact {
  nick: string // biệt danh
  rank: number // ~FIFA world ranking
  star: string // ngôi sao
  conf: 'UEFA' | 'CONMEBOL' | 'CAF' | 'AFC' | 'CONCACAF' | 'OFC'
}

export const TEAM_FACTS: Record<string, TeamFact> = {
  Algeria: { nick: 'Les Fennecs', rank: 36, star: 'Riyad Mahrez', conf: 'CAF' },
  Argentina: { nick: 'La Albiceleste', rank: 4, star: 'Lionel Messi', conf: 'CONMEBOL' },
  Australia: { nick: 'Socceroos', rank: 26, star: 'Mathew Ryan', conf: 'AFC' },
  Austria: { nick: 'Das Team', rank: 22, star: 'David Alaba', conf: 'UEFA' },
  Belgium: { nick: 'Quỷ Đỏ', rank: 9, star: 'Kevin De Bruyne', conf: 'UEFA' },
  'Bosnia & Herzegovina': { nick: 'Zmajevi', rank: 40, star: 'Edin Džeko', conf: 'UEFA' },
  Brazil: { nick: 'Seleção', rank: 5, star: 'Vinícius Júnior', conf: 'CONMEBOL' },
  Canada: { nick: 'Les Rouges', rank: 27, star: 'Alphonso Davies', conf: 'CONCACAF' },
  'Cape Verde': { nick: 'Tubarões Azuis', rank: 70, star: 'Ryan Mendes', conf: 'CAF' },
  Colombia: { nick: 'Los Cafeteros', rank: 14, star: 'Luis Díaz', conf: 'CONMEBOL' },
  Croatia: { nick: 'Vatreni', rank: 10, star: 'Luka Modrić', conf: 'UEFA' },
  Curaçao: { nick: 'Blue Wave', rank: 82, star: 'Leandro Bacuna', conf: 'CONCACAF' },
  'Czech Republic': { nick: 'Národní tým', rank: 42, star: 'Patrik Schick', conf: 'UEFA' },
  'DR Congo': { nick: 'Léopards', rank: 56, star: 'Cédric Bakambu', conf: 'CAF' },
  Ecuador: { nick: 'La Tri', rank: 23, star: 'Moisés Caicedo', conf: 'CONMEBOL' },
  Egypt: { nick: 'Pharaohs', rank: 33, star: 'Mohamed Salah', conf: 'CAF' },
  England: { nick: 'Tam Sư', rank: 4, star: 'Jude Bellingham', conf: 'UEFA' },
  France: { nick: 'Les Bleus', rank: 2, star: 'Kylian Mbappé', conf: 'UEFA' },
  Germany: { nick: 'Die Mannschaft', rank: 12, star: 'Jamal Musiala', conf: 'UEFA' },
  Ghana: { nick: 'Black Stars', rank: 73, star: 'Mohammed Kudus', conf: 'CAF' },
  Haiti: { nick: 'Les Grenadiers', rank: 84, star: 'Frantzdy Pierrot', conf: 'CONCACAF' },
  Iran: { nick: 'Team Melli', rank: 18, star: 'Mehdi Taremi', conf: 'AFC' },
  Iraq: { nick: 'Lions of Mesopotamia', rank: 58, star: 'Aymen Hussein', conf: 'AFC' },
  'Ivory Coast': { nick: 'Les Éléphants', rank: 41, star: 'Sébastien Haller', conf: 'CAF' },
  Japan: { nick: 'Samurai Blue', rank: 17, star: 'Takefusa Kubo', conf: 'AFC' },
  Jordan: { nick: 'Al-Nashama', rank: 62, star: 'Mousa Al-Taamari', conf: 'AFC' },
  Mexico: { nick: 'El Tri', rank: 16, star: 'Santiago Giménez', conf: 'CONCACAF' },
  Morocco: { nick: 'Atlas Lions', rank: 11, star: 'Achraf Hakimi', conf: 'CAF' },
  Netherlands: { nick: 'Oranje', rank: 7, star: 'Virgil van Dijk', conf: 'UEFA' },
  'New Zealand': { nick: 'All Whites', rank: 86, star: 'Chris Wood', conf: 'OFC' },
  Norway: { nick: 'Løvene', rank: 28, star: 'Erling Haaland', conf: 'UEFA' },
  Panama: { nick: 'La Marea Roja', rank: 31, star: 'Adalberto Carrasquilla', conf: 'CONCACAF' },
  Paraguay: { nick: 'La Albirroja', rank: 39, star: 'Miguel Almirón', conf: 'CONMEBOL' },
  Portugal: { nick: 'A Seleção', rank: 5, star: 'Cristiano Ronaldo', conf: 'UEFA' },
  Qatar: { nick: 'Annabi', rank: 51, star: 'Akram Afif', conf: 'AFC' },
  'Saudi Arabia': { nick: 'Green Falcons', rank: 59, star: 'Salem Al-Dawsari', conf: 'AFC' },
  Scotland: { nick: 'Tartan Army', rank: 38, star: 'Scott McTominay', conf: 'UEFA' },
  Senegal: { nick: 'Lions of Teranga', rank: 19, star: 'Sadio Mané', conf: 'CAF' },
  'South Africa': { nick: 'Bafana Bafana', rank: 60, star: 'Percy Tau', conf: 'CAF' },
  'South Korea': { nick: 'Taegeuk Warriors', rank: 23, star: 'Son Heung-min', conf: 'AFC' },
  Spain: { nick: 'La Roja', rank: 3, star: 'Lamine Yamal', conf: 'UEFA' },
  Sweden: { nick: 'Blågult', rank: 35, star: 'Alexander Isak', conf: 'UEFA' },
  Switzerland: { nick: 'Nati', rank: 20, star: 'Granit Xhaka', conf: 'UEFA' },
  Tunisia: { nick: 'Eagles of Carthage', rank: 44, star: 'Hannibal Mejbri', conf: 'CAF' },
  Turkey: { nick: 'Ay-Yıldızlılar', rank: 26, star: 'Arda Güler', conf: 'UEFA' },
  USA: { nick: 'Stars and Stripes', rank: 15, star: 'Christian Pulisic', conf: 'CONCACAF' },
  Uruguay: { nick: 'La Celeste', rank: 13, star: 'Federico Valverde', conf: 'CONMEBOL' },
  Uzbekistan: { nick: 'White Wolves', rank: 57, star: 'Eldor Shomurodov', conf: 'AFC' },
}

export const getFact = (name: string): TeamFact | null => TEAM_FACTS[name] ?? null
