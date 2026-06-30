import { test } from 'node:test'
import assert from 'node:assert'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

// ingest.js imports db.js, which opens a node:sqlite database on load.
// Point it at a throwaway temp file so the test never touches a real DB.
process.env.WC_DB = join(tmpdir(), `wc-test-${process.pid}-${Date.now()}.db`)

// node:sqlite is available on Node v24.13+ (the deploy target). If it's
// missing on this local machine, skip the mapMatch test rather than fail the
// whole suite — the pure-logic tests (time/scoring/auth) still cover the core.
let mod = null
let sqliteAvailable = true
try {
  await import('node:sqlite')
} catch {
  sqliteAvailable = false
}
if (sqliteAvailable) {
  mod = await import('../src/ingest.js')
}

test('mapMatch: group opener → kickoff + stage', { skip: !sqliteAvailable && 'node:sqlite unavailable' }, () => {
  const raw = {
    round: 'Matchday 1',
    date: '2026-06-11',
    time: '13:00 UTC-6',
    team1: 'Mexico',
    team2: 'South Africa',
    group: 'Group A',
    ground: 'Mexico City',
  }
  const m = mod.mapMatch(raw, 0)
  assert.equal(m.id, 'of-0')
  assert.equal(m.stage, 'group')
  assert.equal(m.group, 'Group A')
  assert.equal(m.kickoff_utc, Date.UTC(2026, 5, 11, 19, 0, 0) / 1000)
  assert.equal(m.team1, 'Mexico')
  assert.equal(m.team2, 'South Africa')
  assert.equal(m.ground, 'Mexico City')
  assert.equal(m.score1, null)
  assert.equal(m.score2, null)
})

test('mapMatch: knockout stage derivation', { skip: !sqliteAvailable && 'node:sqlite unavailable' }, () => {
  assert.equal(mod.mapMatch({ round: 'Round of 32', date: '2026-06-28', time: '12:00 UTC-7', team1: '2A', team2: '2B', ground: 'LA' }, 72).stage, 'r32')
  assert.equal(mod.mapMatch({ round: 'Round of 16', date: '2026-06-28', time: '12:00 UTC-7', team1: 'a', team2: 'b', ground: 'x' }, 1).stage, 'r16')
  assert.equal(mod.mapMatch({ round: 'Quarter-final', date: '2026-07-09', time: '12:00 UTC-7', team1: 'a', team2: 'b', ground: 'x' }, 1).stage, 'qf')
  assert.equal(mod.mapMatch({ round: 'Semi-final', date: '2026-07-14', time: '12:00 UTC-7', team1: 'a', team2: 'b', ground: 'x' }, 1).stage, 'sf')
  assert.equal(mod.mapMatch({ round: 'Match for third place', date: '2026-07-18', time: '12:00 UTC-7', team1: 'a', team2: 'b', ground: 'x' }, 1).stage, 'third')
  assert.equal(mod.mapMatch({ round: 'Final', date: '2026-07-19', time: '15:00 UTC-4', team1: 'a', team2: 'b', ground: 'x' }, 1).stage, 'final')
})

test('extractScore: both shapes', { skip: !sqliteAvailable && 'node:sqlite unavailable' }, () => {
  assert.deepEqual(mod.extractScore({ score1: 2, score2: 1 }), {
    score1: 2,
    score2: 1,
    penalty1: null,
    penalty2: null,
  })
  assert.deepEqual(mod.extractScore({ score: { ft: [3, 0], p: [4, 2] } }), {
    score1: 3,
    score2: 0,
    penalty1: 4,
    penalty2: 2,
  })
  assert.deepEqual(mod.extractScore({}), {
    score1: null,
    score2: null,
    penalty1: null,
    penalty2: null,
  })
})
