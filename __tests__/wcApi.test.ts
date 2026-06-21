import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  BASE,
  getSchedule,
  login,
  changePassword,
  savePick,
  getToken,
  getName,
  logout,
} from '@/lib/wcApi'

function jsonRes(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response
}

describe('wcApi', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('getSchedule hits ${BASE}/schedule and returns matches', async () => {
    const matches = [{ id: 'm1' }]
    const fetchMock = vi.fn().mockResolvedValue(jsonRes({ matches }))
    vi.stubGlobal('fetch', fetchMock)

    const out = await getSchedule()
    expect(fetchMock).toHaveBeenCalledWith(`${BASE}/schedule`)
    expect(out).toEqual(matches)
  })

  it('getSchedule appends an encoded name query', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonRes({ matches: [] }))
    vi.stubGlobal('fetch', fetchMock)

    await getSchedule('An Nam')
    expect(fetchMock).toHaveBeenCalledWith(`${BASE}/schedule?name=An%20Nam`)
  })

  it('login stores token + name and returns the token', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonRes({ token: 'tok-123' }))
    vi.stubGlobal('fetch', fetchMock)

    const token = await login('Nam', 'secret')
    expect(token).toBe('tok-123')
    expect(getToken()).toBe('tok-123')
    expect(getName()).toBe('Nam')

    const [, init] = fetchMock.mock.calls[0]
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body)).toEqual({ name: 'Nam', password: 'secret' })
  })

  it('login throws on HTTP 401', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonRes({}, 401))
    vi.stubGlobal('fetch', fetchMock)
    await expect(login('Nam', 'bad')).rejects.toThrow()
    expect(getToken()).toBeNull()
  })

  it('changePassword sends bearer auth and current/new passwords', async () => {
    localStorage.setItem('wc_token', 'tok-abc')
    const fetchMock = vi.fn().mockResolvedValue(jsonRes({ ok: true }))
    vi.stubGlobal('fetch', fetchMock)

    await changePassword('oldpass', 'newpass')

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe(`${BASE}/change-password`)
    expect(init.method).toBe('POST')
    expect(init.headers.Authorization).toBe('Bearer tok-abc')
    expect(JSON.parse(init.body)).toEqual({
      currentPassword: 'oldpass',
      newPassword: 'newpass',
    })
  })

  it('changePassword throws stable errors from the API', async () => {
    localStorage.setItem('wc_token', 'tok-abc')
    const fetchMock = vi.fn().mockResolvedValue(jsonRes({ error: 'bad_current_password' }, 401))
    vi.stubGlobal('fetch', fetchMock)

    await expect(changePassword('wrong', 'newpass')).rejects.toThrow('bad_current_password')
  })

  it('savePick sends an Authorization Bearer header', async () => {
    localStorage.setItem('wc_token', 'tok-xyz')
    const fetchMock = vi.fn().mockResolvedValue(jsonRes({ ok: true }))
    vi.stubGlobal('fetch', fetchMock)

    await savePick('m1', '1')
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe(`${BASE}/picks`)
    expect(init.headers.Authorization).toBe('Bearer tok-xyz')
    expect(JSON.parse(init.body)).toEqual({ matchId: 'm1', pick: '1' })
  })

  it('savePick throws on HTTP 423 (locked)', async () => {
    localStorage.setItem('wc_token', 'tok-xyz')
    const fetchMock = vi.fn().mockResolvedValue(jsonRes({}, 423))
    vi.stubGlobal('fetch', fetchMock)
    await expect(savePick('m1', '1')).rejects.toThrow()
  })

  it('logout clears session', () => {
    localStorage.setItem('wc_token', 't')
    localStorage.setItem('wc_name', 'n')
    logout()
    expect(getToken()).toBeNull()
    expect(getName()).toBeNull()
  })
})
