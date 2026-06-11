import { test } from 'node:test'
import assert from 'node:assert'
import { result, moneyFor, FINE_WRONG, FINE_MISS } from '../src/scoring.js'

test('result', () => {
  assert.equal(result(2, 1), '1')
  assert.equal(result(1, 1), 'X')
  assert.equal(result(0, 2), '2')
})

test('money: correct guess costs nothing', () => {
  assert.equal(moneyFor('1', 2, 1), 0)
  assert.equal(moneyFor('X', 1, 1), 0)
  assert.equal(moneyFor('2', 0, 2), 0)
})

test('money: wrong guess is fined FINE_WRONG', () => {
  assert.equal(moneyFor('X', 2, 1), -FINE_WRONG)
  assert.equal(moneyFor('1', 1, 1), -FINE_WRONG)
  assert.equal(moneyFor('1', 0, 2), -FINE_WRONG)
})

test('money: not selected is fined FINE_MISS', () => {
  assert.equal(moneyFor(null, 1, 0), -FINE_MISS)
  assert.equal(moneyFor(null, 1, 1), -FINE_MISS)
})

test('money: null-safe before the match has a score', () => {
  assert.equal(moneyFor('1', null, 1), 0)
  assert.equal(moneyFor('1', 1, null), 0)
  assert.equal(moneyFor(null, null, null), 0)
})

test('fines have the expected magnitudes', () => {
  assert.equal(FINE_WRONG, 30000)
  assert.equal(FINE_MISS, 100000)
})
