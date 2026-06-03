import { test } from 'node:test'
import assert from 'node:assert'
import { kickoffEpoch } from '../src/time.js'

test('UTC-6 13:00 on 2026-06-11 → 19:00Z', () => {
  assert.equal(kickoffEpoch('2026-06-11', '13:00 UTC-6'), Date.UTC(2026, 5, 11, 19, 0, 0) / 1000)
})

test('UTC-4 15:00 final → 19:00Z', () => {
  assert.equal(kickoffEpoch('2026-07-19', '15:00 UTC-4'), Date.UTC(2026, 6, 19, 19, 0, 0) / 1000)
})

test('UTC-7 12:00 → 19:00Z', () => {
  assert.equal(kickoffEpoch('2026-06-28', '12:00 UTC-7'), Date.UTC(2026, 5, 28, 19, 0, 0) / 1000)
})

test('positive offset UTC+2 21:00 → 19:00Z', () => {
  assert.equal(kickoffEpoch('2026-06-11', '21:00 UTC+2'), Date.UTC(2026, 5, 11, 19, 0, 0) / 1000)
})

test('rejects malformed time', () => {
  assert.throws(() => kickoffEpoch('2026-06-11', '13h00'), /bad time/)
})
