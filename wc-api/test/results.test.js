import { test } from 'node:test'
import assert from 'node:assert'
import { normTeam, pairKey, isFinished, applyResults } from '../src/results.js'

test('normTeam folds the Bosnia alias and is case/space stable', () => {
  assert.equal(normTeam('Bosnia & Herzegovina'), normTeam('Bosnia-Herzegovina'))
  assert.equal(normTeam('  South   Korea '), 'south korea')
  assert.equal(normTeam('USA'), 'usa')
})

test('pairKey is order-independent', () => {
  assert.equal(pairKey('Mexico', 'South Africa'), pairKey('South Africa', 'Mexico'))
  assert.notEqual(pairKey('Mexico', 'Canada'), pairKey('Mexico', 'South Africa'))
})

test('isFinished only accepts terminal statuses', () => {
  assert.ok(isFinished('FT'))
  assert.ok(isFinished('AET'))
  assert.ok(isFinished('AP'))
  assert.ok(!isFinished('1H'))
  assert.ok(!isFinished('HT'))
  assert.ok(!isFinished('Not Started'))
  assert.ok(!isFinished(''))
})

test('applyResults assigns scores in the correct orientation', () => {
  const matches = [
    { id: 'm1', team1: 'Mexico', team2: 'South Africa', score1: null, score2: null },
    // our team1 is the AWAY side here — score must be flipped to match
    { id: 'm2', team1: 'Haiti', team2: 'Morocco', score1: null, score2: null },
  ]
  const writes = []
  const setScoreFn = (id, s1, s2, p1, p2) => {
    writes.push({ id, s1, s2, p1, p2 })
    return true
  }
  const results = [
    { home: 'Mexico', away: 'South Africa', hs: 2, as: 0 }, // team1==home
    { home: 'Morocco', away: 'Haiti', hs: 3, as: 1 }, // team1(Haiti)==away
  ]
  const n = applyResults(results, matches, setScoreFn)
  assert.equal(n, 2)
  assert.deepEqual(writes[0], { id: 'm1', s1: 2, s2: 0, p1: null, p2: null })
  assert.deepEqual(writes[1], { id: 'm2', s1: 1, s2: 3, p1: null, p2: null }) // Haiti 1, Morocco 3
})

test('applyResults assigns penalty shootout scores in the correct orientation', () => {
  const matches = [
    { id: 'p1', team1: 'Germany', team2: 'Paraguay', score1: null, score2: null, penalty1: null, penalty2: null },
    // our team1 is the away side here; penalty scores must flip too.
    { id: 'p2', team1: 'Morocco', team2: 'Netherlands', score1: null, score2: null, penalty1: null, penalty2: null },
  ]
  const writes = []
  const n = applyResults(
    [
      { home: 'Germany', away: 'Paraguay', hs: 1, as: 1, hp: 3, ap: 4 },
      { home: 'Netherlands', away: 'Morocco', hs: 1, as: 1, hp: 2, ap: 3 },
    ],
    matches,
    (id, s1, s2, p1, p2) => (writes.push({ id, s1, s2, p1, p2 }), true),
  )
  assert.equal(n, 2)
  assert.deepEqual(writes[0], { id: 'p1', s1: 1, s2: 1, p1: 3, p2: 4 })
  assert.deepEqual(writes[1], { id: 'p2', s1: 1, s2: 1, p1: 3, p2: 2 })
})

test('applyResults folds the Bosnia alias when matching', () => {
  const matches = [{ id: 'b', team1: 'Bosnia & Herzegovina', team2: 'Austria', score1: null, score2: null }]
  const writes = []
  const n = applyResults(
    [{ home: 'Bosnia-Herzegovina', away: 'Austria', hs: 1, as: 1 }],
    matches,
    (id, s1, s2, p1, p2) => (writes.push({ id, s1, s2, p1, p2 }), true),
  )
  assert.equal(n, 1)
  assert.deepEqual(writes[0], { id: 'b', s1: 1, s2: 1, p1: null, p2: null })
})

test('applyResults skips unknown pairs and unchanged scores', () => {
  const matches = [{ id: 'x', team1: 'Mexico', team2: 'South Africa', score1: 2, score2: 0 }]
  const writes = []
  const setScoreFn = (id, s1, s2) => (writes.push({ id, s1, s2 }), true)
  const n = applyResults(
    [
      { home: 'Mexico', away: 'South Africa', hs: 2, as: 0 }, // unchanged → skip
      { home: 'Spain', away: 'Brazil', hs: 1, as: 0 }, // unknown pair → skip
    ],
    matches,
    setScoreFn,
  )
  assert.equal(n, 0)
  assert.equal(writes.length, 0)
})
