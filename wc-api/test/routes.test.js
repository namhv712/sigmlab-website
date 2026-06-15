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

// --- Copy-betting (live follow) -------------------------------------------

// Register a member and return their bearer token.
async function reg(name, ip) {
  const r = await post('/register', { name, password: 'pw1234' }, { ip })
  assert.equal(r.statusCode, 200, `register ${name}`)
  return J(r).token
}
function auth(token) {
  return { Authorization: `Bearer ${token}` }
}

test('follow mirrors target future picks; blind on upcoming, revealed on finish', async () => {
  const nowSec = Math.floor(Date.now() / 1000)
  db.upsertMatch({
    id: 'cb-up', stage: 'group', group: 'B', kickoff_utc: nowSec + 86400,
    team1: 'Spain', team2: 'Japan', ground: 'Z',
  })
  const aliceTok = await reg('CB-Alice', '11.0.0.1')
  const bobTok = await reg('CB-Bob', '11.0.0.2')

  // Alice picks the upcoming match.
  const ap = await post('/picks', { matchId: 'cb-up', pick: '1' }, { ip: '11.0.0.1', headers: auth(aliceTok) })
  assert.equal(ap.statusCode, 200)

  // Bob follows Alice → her pick is filled into Bob.
  const fol = await post('/follow', { targetName: 'CB-Alice' }, { ip: '11.0.0.2', headers: auth(bobTok) })
  assert.equal(fol.statusCode, 200)
  assert.equal(J(fol).filled, 1)

  // Blind: Bob's schedule shows the match covered but withholds the value.
  const sched = await app.inject({ method: 'GET', url: '/schedule?name=CB-Bob' })
  const up = J(sched).matches.find((m) => m.id === 'cb-up')
  assert.equal(up.myPick, null, 'copied value must stay hidden pre-kickoff')
  assert.equal(up.copying, true)
  assert.equal(up.copyingFrom, 'CB-Alice')
})

test('follow propagates later target changes; manual override wins and is sticky', async () => {
  const nowSec = Math.floor(Date.now() / 1000)
  db.upsertMatch({
    id: 'cb-up2', stage: 'group', group: 'C', kickoff_utc: nowSec + 86400,
    team1: 'France', team2: 'Iran', ground: 'Z',
  })
  const cTok = await reg('CB-Carl', '11.0.1.1')
  const dTok = await reg('CB-Dora', '11.0.1.2')

  // Dora follows Carl BEFORE he picks (nothing to fill yet).
  const fol = await post('/follow', { targetName: 'CB-Carl' }, { ip: '11.0.1.2', headers: auth(dTok) })
  assert.equal(J(fol).filled, 0)

  // Carl picks → propagates to Dora.
  await post('/picks', { matchId: 'cb-up2', pick: '2' }, { ip: '11.0.1.1', headers: auth(cTok) })
  let d = db.userPickRows(db.getUserByName('CB-Dora').id)
  assert.equal(d['cb-up2'].pick, '2')
  assert.ok(d['cb-up2'].copiedFrom != null, 'should be tagged as copied')

  // Dora manually overrides → her pick wins.
  await post('/picks', { matchId: 'cb-up2', pick: 'X' }, { ip: '11.0.1.2', headers: auth(dTok) })
  d = db.userPickRows(db.getUserByName('CB-Dora').id)
  assert.equal(d['cb-up2'].pick, 'X')
  assert.equal(d['cb-up2'].copiedFrom, null, 'manual pick clears copied_from')

  // Carl changes again → Dora's manual pick is NOT clobbered (sticky).
  await post('/picks', { matchId: 'cb-up2', pick: '1' }, { ip: '11.0.1.1', headers: auth(cTok) })
  d = db.userPickRows(db.getUserByName('CB-Dora').id)
  assert.equal(d['cb-up2'].pick, 'X')
})

test('follow validation: self-follow → 400, unknown target → 404', async () => {
  const tok = await reg('CB-Eve', '11.0.2.1')
  const self = await post('/follow', { targetName: 'CB-Eve' }, { ip: '11.0.2.1', headers: auth(tok) })
  assert.equal(self.statusCode, 400)
  assert.equal(J(self).error, 'cannot_follow_self')
  const ghost = await post('/follow', { targetName: 'NoSuchUser' }, { ip: '11.0.2.1', headers: auth(tok) })
  assert.equal(ghost.statusCode, 404)
})

test('finished-match breakdown reveals copiedFrom', async () => {
  const nowSec = Math.floor(Date.now() / 1000)
  // A future match the pair both bet on, which we then move to the past + score.
  db.upsertMatch({
    id: 'cb-fin', stage: 'group', group: 'D', kickoff_utc: nowSec + 86400,
    team1: 'Italy', team2: 'Ghana', ground: 'Z',
  })
  const gTok = await reg('CB-Gina', '11.0.3.1')
  const hTok = await reg('CB-Hugo', '11.0.3.2')
  await post('/picks', { matchId: 'cb-fin', pick: '1' }, { ip: '11.0.3.1', headers: auth(gTok) })
  await post('/follow', { targetName: 'CB-Gina' }, { ip: '11.0.3.2', headers: auth(hTok) })

  // Lock + finish the match: move kickoff to the past and set a score.
  db.upsertMatch({
    id: 'cb-fin', stage: 'group', group: 'D', kickoff_utc: nowSec - 3 * 3600,
    team1: 'Italy', team2: 'Ghana', ground: 'Z', score1: 2, score2: 0,
  })

  const sched = await app.inject({ method: 'GET', url: '/schedule' })
  const fin = J(sched).matches.find((m) => m.id === 'cb-fin')
  assert.equal(fin.status, 'finished')
  const hugo = fin.picks.find((p) => p.name === 'CB-Hugo')
  const gina = fin.picks.find((p) => p.name === 'CB-Gina')
  assert.equal(hugo.pick, '1')
  assert.equal(hugo.copiedFrom, 'CB-Gina', 'breakdown reveals who copied whom')
  assert.equal(gina.copiedFrom, null, 'manual picker shows no copy source')
})
