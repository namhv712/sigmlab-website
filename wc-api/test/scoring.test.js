import { test } from 'node:test'
import assert from 'node:assert'
import { result, resultForMatch, moneyFor, FINE_WRONG, FINE_MISS, TWO_CHOICE_RULE_START } from '../src/scoring.js'

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

test('resultForMatch preserves old-rule draw results before the cutoff', () => {
  assert.equal(
    resultForMatch({ kickoff_utc: TWO_CHOICE_RULE_START - 1, score1: 1, score2: 1 }),
    'X',
  )
})

test('resultForMatch uses penalty shootout winner for new tied matches', () => {
  assert.equal(
    resultForMatch({
      kickoff_utc: TWO_CHOICE_RULE_START,
      score1: 1,
      score2: 1,
      penalty1: 3,
      penalty2: 4,
    }),
    '2',
  )
  assert.equal(
    resultForMatch({
      kickoff_utc: TWO_CHOICE_RULE_START,
      score1: 0,
      score2: 0,
      penalty1: 5,
      penalty2: 4,
    }),
    '1',
  )
})

test('resultForMatch waits for penalties on new tied matches', () => {
  assert.equal(
    resultForMatch({ kickoff_utc: TWO_CHOICE_RULE_START, score1: 1, score2: 1 }),
    null,
  )
})

test('fines have the expected magnitudes', () => {
  assert.equal(FINE_WRONG, 30000)
  assert.equal(FINE_MISS, 100000)
})
