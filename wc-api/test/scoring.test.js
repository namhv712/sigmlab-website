import { test } from 'node:test'
import assert from 'node:assert'
import { result, pointsFor } from '../src/scoring.js'

test('result', () => {
  assert.equal(result(2, 1), '1')
  assert.equal(result(1, 1), 'X')
  assert.equal(result(0, 2), '2')
})

test('points', () => {
  assert.equal(pointsFor('1', 2, 1), 3)
  assert.equal(pointsFor('X', 2, 1), 0)
  assert.equal(pointsFor('X', 1, 1), 3)
  assert.equal(pointsFor('2', 0, 2), 3)
})

test('points null-safe', () => {
  assert.equal(pointsFor('1', null, 1), 0)
  assert.equal(pointsFor('1', 1, null), 0)
  assert.equal(pointsFor(null, 1, 0), 0)
})
