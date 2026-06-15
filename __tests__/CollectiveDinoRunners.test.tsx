import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import CollectiveDinoRunners, { dinoSpeed } from '@/components/wc/CollectiveDinoRunners'

describe('dinoSpeed', () => {
  it('scales speed linearly with size', () => {
    expect(dinoSpeed(100, 'trex')).toBeCloseTo(2 * dinoSpeed(50, 'trex'))
    expect(dinoSpeed(100, 'raptor')).toBeCloseTo(2 * dinoSpeed(50, 'raptor'))
  })

  it('makes a raptor 1.5x faster than a T-Rex of the same size', () => {
    for (const size of [40, 73, 160, 220]) {
      expect(dinoSpeed(size, 'raptor')).toBeCloseTo(1.5 * dinoSpeed(size, 'trex'))
    }
  })

  it('gives a bigger dino a higher speed than a smaller one of the same species', () => {
    expect(dinoSpeed(160, 'trex')).toBeGreaterThan(dinoSpeed(73, 'trex'))
    expect(dinoSpeed(160, 'raptor')).toBeGreaterThan(dinoSpeed(73, 'raptor'))
  })
})

describe('CollectiveDinoRunners', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('groups each ten leaderboard dinosaurs into one larger sprite', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          rows: [
            { name: 'A', vnd: -1_420_000, correct: 0, wrong: 17, missed: 9, finished: 26 },
            { name: 'B', vnd: -1_220_000, correct: 1, wrong: 14, missed: 4, finished: 19 },
          ],
        }),
      })),
    )

    render(<CollectiveDinoRunners />)

    const trexes = await screen.findAllByTestId('dino-trex')
    const raptors = await screen.findAllByTestId('dino-raptor')

    expect(trexes).toHaveLength(4)
    expect(raptors).toHaveLength(4)
    expect(sumDinoWeights(trexes)).toBe(13)
    expect(sumDinoWeights(raptors)).toBe(31)
    expect(trexes.filter((node) => node.dataset.dinoWeight === '10')).toHaveLength(1)
    expect(raptors.filter((node) => node.dataset.dinoWeight === '10')).toHaveLength(3)
  })
})

function sumDinoWeights(nodes: HTMLElement[]) {
  return nodes.reduce((total, node) => total + Number(node.dataset.dinoWeight), 0)
}
