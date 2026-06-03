import { test } from 'node:test'
import assert from 'node:assert'
import crypto from 'node:crypto'
import { signToken, verifyToken, checkPasscode } from '../src/auth.js'

test('roundtrip', () => {
  const t = signToken('alice', 'secret', 9999999999)
  assert.equal(verifyToken(t, 'secret').name, 'alice')
  assert.equal(verifyToken(t, 'wrong'), null)
})

test('expired', () => {
  assert.equal(verifyToken(signToken('bob', 's', 1), 's'), null)
})

test('tampered payload rejected', () => {
  const t = signToken('carol', 's', 9999999999)
  const tampered = t.replace(/^[^.]+/, Buffer.from(JSON.stringify({ name: 'mallory', exp: 9999999999 })).toString('base64url'))
  assert.equal(verifyToken(tampered, 's'), null)
})

test('malformed token rejected', () => {
  assert.equal(verifyToken('not-a-token', 's'), null)
  assert.equal(verifyToken(null, 's'), null)
})

test('checkPasscode', () => {
  const hash = crypto.createHash('sha256').update('sigm2026').digest('hex')
  assert.equal(checkPasscode('sigm2026', hash), true)
  assert.equal(checkPasscode('wrong', hash), false)
  assert.equal(checkPasscode('sigm2026', ''), false)
})
