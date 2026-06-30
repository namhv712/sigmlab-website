import { test } from 'node:test'
import assert from 'node:assert'
import crypto from 'node:crypto'

// Configure env BEFORE importing db.js/routes.js (they read env at import time).
process.env.WC_DB = ':memory:'
process.env.WC_TOKEN_SECRET = 'test-secret'
process.env.WC_ADMIN_PASSCODE_HASH = crypto.createHash('sha256').update('admin-pw').digest('hex')
// Leave the view gate unconfigured so it fail-opens for these tests.
delete process.env.WC_VIEW_COOKIE
delete process.env.WC_MEMBER_PASSCODE_HASH

const Fastify = (await import('fastify')).default
const { default: routes } = await import('../src/routes.js')
const db = await import('../src/db.js')

const app = Fastify()
await app.register(routes)

const J = (r) => JSON.parse(r.body)
// Distinct remoteAddress per test → fresh rate-limit bucket, no cross-test bleed.
function post(url, body, { headers = {}, ip = '127.0.0.1' } = {}) {
  return app.inject({ method: 'POST', url, payload: body ?? {}, headers, remoteAddress: ip })
}

test('register new name returns a token; duplicate name → 409 name_taken', async () => {
  const ip = '10.0.0.1'
  const r1 = await post('/register', { name: 'Alice', password: 'pw1234' }, { ip })
  assert.equal(r1.statusCode, 200)
  assert.ok(J(r1).token, 'expected a token')
  const r2 = await post('/register', { name: 'Alice', password: 'другой' }, { ip })
  assert.equal(r2.statusCode, 409)
  assert.equal(J(r2).error, 'name_taken')
})

test('register validation: short password and blank name → 400', async () => {
  const ip = '10.0.0.2'
  const short = await post('/register', { name: 'Bob', password: 'ab' }, { ip })
  assert.equal(short.statusCode, 400)
  const blank = await post('/register', { name: '   ', password: 'pw1234' }, { ip })
  assert.equal(blank.statusCode, 400)
})

test('login: correct password → token; wrong pw and unknown name → 401 bad_login', async () => {
  const ip = '10.0.0.3'
  const reg = await post('/register', { name: 'Carol', password: 'pw1234' }, { ip })
  assert.equal(reg.statusCode, 200)
  const ok = await post('/login', { name: 'Carol', password: 'pw1234' }, { ip })
  assert.equal(ok.statusCode, 200)
  assert.ok(J(ok).token)
  const wrong = await post('/login', { name: 'Carol', password: 'nope!!' }, { ip })
  assert.equal(wrong.statusCode, 401)
  assert.equal(J(wrong).error, 'bad_login')
  const unknown = await post('/login', { name: 'Ghost', password: 'whatever' }, { ip })
  assert.equal(unknown.statusCode, 401)
  assert.equal(J(unknown).error, 'bad_login')
})

test('admin reset-password lets the user log in with the new password', async () => {
  const ip = '10.0.0.4'
  await post('/register', { name: 'Dave', password: 'oldpass' }, { ip })
  const reset = await post(
    '/admin/reset-password',
    { name: 'Dave', newPassword: 'fresh99' },
    { ip, headers: { 'x-admin-passcode': 'admin-pw' } },
  )
  assert.equal(reset.statusCode, 200)
  // Old password no longer works, new one does.
  const oldLogin = await post('/login', { name: 'Dave', password: 'oldpass' }, { ip })
  assert.equal(oldLogin.statusCode, 401)
  const newLogin = await post('/login', { name: 'Dave', password: 'fresh99' }, { ip })
  assert.equal(newLogin.statusCode, 200)
})

test('admin reset-password rejects bad admin passcode and unknown user', async () => {
  const ip = '10.0.0.5'
  await post('/register', { name: 'Erin', password: 'pw1234' }, { ip })
  const badAdmin = await post(
    '/admin/reset-password',
    { name: 'Erin', newPassword: 'whatever' },
    { ip, headers: { 'x-admin-passcode': 'wrong' } },
  )
  assert.equal(badAdmin.statusCode, 401)
  const unknownUser = await post(
    '/admin/reset-password',
    { name: 'Nobody', newPassword: 'whatever' },
    { ip, headers: { 'x-admin-passcode': 'admin-pw' } },
  )
  assert.equal(unknownUser.statusCode, 404)
  assert.equal(J(unknownUser).error, 'unknown_user')
})

test('change-password requires auth and current password, then updates future logins', async () => {
  const ip = '10.0.0.6'
  const reg = await post('/register', { name: 'Frank', password: 'oldpass' }, { ip })
  assert.equal(reg.statusCode, 200)
  const token = J(reg).token

  const noAuth = await post('/change-password', { currentPassword: 'oldpass', newPassword: 'newpass' }, { ip })
  assert.equal(noAuth.statusCode, 401)
  assert.equal(J(noAuth).error, 'unauthorized')

  const wrongCurrent = await post(
    '/change-password',
    { currentPassword: 'wrongpass', newPassword: 'newpass' },
    { ip, headers: auth(token) },
  )
  assert.equal(wrongCurrent.statusCode, 401)
  assert.equal(J(wrongCurrent).error, 'bad_current_password')

  const shortNew = await post(
    '/change-password',
    { currentPassword: 'oldpass', newPassword: 'x' },
    { ip, headers: auth(token) },
  )
  assert.equal(shortNew.statusCode, 400)
  assert.equal(J(shortNew).error, 'bad_request')

  const ok = await post(
    '/change-password',
    { currentPassword: 'oldpass', newPassword: 'newpass' },
    { ip, headers: auth(token) },
  )
  assert.equal(ok.statusCode, 200)

  const oldLogin = await post('/login', { name: 'Frank', password: 'oldpass' }, { ip })
  assert.equal(oldLogin.statusCode, 401)
  const newLogin = await post('/login', { name: 'Frank', password: 'newpass' }, { ip })
  assert.equal(newLogin.statusCode, 200)
})

test('/schedule reveals everyone’s picks for finished matches but not upcoming ones', async () => {
  const nowSec = Math.floor(Date.now() / 1000)
  // A finished match (kicked off 3h ago, has a score) and an upcoming one.
  db.upsertMatch({
    id: 'fin-1', stage: 'group', group: 'A', kickoff_utc: nowSec - 3 * 3600,
    team1: 'Mexico', team2: 'South Africa', ground: 'X', score1: 2, score2: 0,
  })
  db.upsertMatch({
    id: 'up-1', stage: 'group', group: 'A', kickoff_utc: nowSec + 86400,
    team1: 'Brazil', team2: 'Morocco', ground: 'Y',
  })
  const zoe = db.getOrCreateUser('Zoe')
  const yan = db.getOrCreateUser('Yan')
  db.upsertPick(zoe.id, 'fin-1', '1')
  db.upsertPick(yan.id, 'fin-1', 'X')
  db.upsertPick(zoe.id, 'up-1', '2') // must stay hidden — match not started

  const res = await app.inject({ method: 'GET', url: '/schedule' })
  assert.equal(res.statusCode, 200)
  const matches = J(res).matches
  const fin = matches.find((m) => m.id === 'fin-1')
  const up = matches.find((m) => m.id === 'up-1')

  assert.equal(fin.status, 'finished')
  // Sorted A→Z by name, includes both picks.
  assert.deepEqual(fin.picks, [
    { name: 'Yan', pick: 'X' },
    { name: 'Zoe', pick: '1' },
  ])
  // Upcoming match never leaks picks.
  assert.equal(up.status, 'upcoming')
  assert.equal(up.picks, undefined)
})

// --- Betting and disabled copy mode ----------------------------------------

// Register a member and return their bearer token.
async function reg(name, ip) {
  const r = await post('/register', { name, password: 'pw1234' }, { ip })
  assert.equal(r.statusCode, 200, `register ${name}`)
  return J(r).token
}
function auth(token) {
  return { Authorization: `Bearer ${token}` }
}

test('future picks reject X under the two-choice rule', async () => {
  const nowSec = Math.floor(Date.now() / 1000)
  db.upsertMatch({
    id: 'two-choice-up', stage: 'group', group: 'B', kickoff_utc: nowSec + 86400,
    team1: 'Spain', team2: 'Japan', ground: 'Z',
  })
  const tok = await reg('TwoChoiceUser', '11.0.0.1')
  const bad = await post('/picks', { matchId: 'two-choice-up', pick: 'X' }, { ip: '11.0.0.1', headers: auth(tok) })
  assert.equal(bad.statusCode, 400)
  assert.equal(J(bad).error, 'bad_pick')

  const ok = await post('/picks', { matchId: 'two-choice-up', pick: '2' }, { ip: '11.0.0.1', headers: auth(tok) })
  assert.equal(ok.statusCode, 200)
})

test('copy routes are disabled for old clients', async () => {
  const tok = await reg('CopyDisabledUser', '11.0.1.1')
  const follow = await post('/follow', { targetName: 'Someone' }, { ip: '11.0.1.1', headers: auth(tok) })
  assert.equal(follow.statusCode, 410)
  assert.equal(J(follow).error, 'copy_disabled')

  const status = await app.inject({ method: 'GET', url: '/follow', headers: auth(tok) })
  assert.deepEqual(J(status), { following: null, disabled: true })

  const graph = await app.inject({ method: 'GET', url: '/follows' })
  assert.deepEqual(J(graph), { follows: [], disabled: true })
})

test('disableCopyMode removes only future copied picks and active follows', async () => {
  const nowSec = Math.floor(Date.now() / 1000)
  db.upsertMatch({
    id: 'copy-future', stage: 'group', group: 'B', kickoff_utc: nowSec + 86400,
    team1: 'Germany', team2: 'Chile', ground: 'Z',
  })
  db.upsertMatch({
    id: 'copy-past', stage: 'group', group: 'B', kickoff_utc: nowSec - 3 * 3600,
    team1: 'Italy', team2: 'Ghana', ground: 'Z', score1: 2, score2: 0,
  })
  const target = db.getOrCreateUser('CopyCleanupTarget')
  const follower = db.getOrCreateUser('CopyCleanupFollower')
  db.upsertPick(follower.id, 'copy-future', '1', target.id)
  db.upsertPick(target.id, 'copy-future', '2')
  db.upsertPick(follower.id, 'copy-past', '1', target.id)
  db.setFollow(follower.id, target.id)

  const cleaned = db.disableCopyMode(nowSec)
  assert.ok(cleaned.deletedCopiedPicks >= 1)
  assert.ok(cleaned.deletedFollows >= 1)

  const rows = db.userPickRows(follower.id)
  assert.equal(rows['copy-future'], undefined)
  assert.equal(rows['copy-past'].pick, '1')
  assert.ok(rows['copy-past'].copiedFrom != null)

  const sched = await app.inject({ method: 'GET', url: '/schedule?name=CopyCleanupFollower' })
  const future = J(sched).matches.find((m) => m.id === 'copy-future')
  assert.equal(future.myPick, null)
  assert.equal(future.copying, false)
})

test('finished-match breakdown still reveals historical copiedFrom', async () => {
  const nowSec = Math.floor(Date.now() / 1000)
  db.upsertMatch({
    id: 'cb-fin', stage: 'group', group: 'D', kickoff_utc: nowSec - 3 * 3600,
    team1: 'Italy', team2: 'Ghana', ground: 'Z',
    score1: 2, score2: 0,
  })
  const ginaUser = db.getOrCreateUser('CB-Gina')
  const hugoUser = db.getOrCreateUser('CB-Hugo')
  db.upsertPick(ginaUser.id, 'cb-fin', '1')
  db.upsertPick(hugoUser.id, 'cb-fin', '1', ginaUser.id)

  const sched = await app.inject({ method: 'GET', url: '/schedule' })
  const fin = J(sched).matches.find((m) => m.id === 'cb-fin')
  assert.equal(fin.status, 'finished')
  const hugoPick = fin.picks.find((p) => p.name === 'CB-Hugo')
  assert.equal(hugoPick.pick, '1')
  assert.equal(hugoPick.copiedFrom, 'CB-Gina', 'breakdown reveals who copied whom')
})
