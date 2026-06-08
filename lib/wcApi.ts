// Typed client for the World Cup betting API.
// Same-origin proxy by default; token + name kept in localStorage. SSR-safe.

import type { Match, LeaderRow, Pick } from './wcTypes'

export const BASE = process.env.NEXT_PUBLIC_WC_API || '/api/wc'

const TOKEN_KEY = 'wc_token'
const NAME_KEY = 'wc_name'

function ls(): Storage | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function getToken(): string | null {
  return ls()?.getItem(TOKEN_KEY) ?? null
}

export function getName(): string | null {
  return ls()?.getItem(NAME_KEY) ?? null
}

function setSession(token: string, name: string) {
  const s = ls()
  if (!s) return
  s.setItem(TOKEN_KEY, token)
  s.setItem(NAME_KEY, name)
}

export function logout() {
  const s = ls()
  if (!s) return
  s.removeItem(TOKEN_KEY)
  s.removeItem(NAME_KEY)
}

function authHeaders(): Record<string, string> {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function getSchedule(name?: string): Promise<Match[]> {
  const qs = name ? `?name=${encodeURIComponent(name)}` : ''
  const res = await fetch(`${BASE}/schedule${qs}`)
  if (!res.ok) throw new Error(`schedule failed: ${res.status}`)
  const data = await res.json()
  return data.matches as Match[]
}

export async function getLeaderboard(): Promise<LeaderRow[]> {
  const res = await fetch(`${BASE}/leaderboard`)
  if (!res.ok) throw new Error(`leaderboard failed: ${res.status}`)
  const data = await res.json()
  return data.rows as LeaderRow[]
}

// Register a new betting account (name + own password). Returns the token on
// success. Throws an Error whose message is a stable code the UI maps to text:
// 'name_taken' (409), 'bad_request' (400), 'rate_limited' (429).
export async function register(name: string, password: string): Promise<string> {
  const res = await fetch(`${BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, password }),
  })
  if (res.status === 409) throw new Error('name_taken')
  if (res.status === 429) throw new Error('rate_limited')
  if (res.status === 400) throw new Error('bad_request')
  if (!res.ok) throw new Error(`register failed: ${res.status}`)
  const data = await res.json()
  setSession(data.token, name)
  return data.token as string
}

// Log in with name + the account's own password. Returns the token on success.
// Throws an Error with a stable code: 'bad_login' (401), 'rate_limited' (429).
export async function login(name: string, password: string): Promise<string> {
  const res = await fetch(`${BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, password }),
  })
  if (res.status === 401) throw new Error('bad_login')
  if (res.status === 429) throw new Error('rate_limited')
  if (!res.ok) throw new Error(`login failed: ${res.status}`)
  const data = await res.json()
  setSession(data.token, name)
  return data.token as string
}

export async function getMyPicks(): Promise<Record<string, Pick>> {
  const res = await fetch(`${BASE}/mypicks`, { headers: authHeaders() })
  if (!res.ok) throw new Error(`mypicks failed: ${res.status}`)
  const data = await res.json()
  return data.picks as Record<string, Pick>
}

// Throws on locked match (HTTP 423) or invalid pick (400).
export async function savePick(matchId: string, pick: Pick): Promise<void> {
  const res = await fetch(`${BASE}/picks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ matchId, pick }),
  })
  if (res.status === 423) throw new Error('Trận đấu đã bắt đầu — không thể cược')
  if (!res.ok) throw new Error(`savePick failed: ${res.status}`)
}
