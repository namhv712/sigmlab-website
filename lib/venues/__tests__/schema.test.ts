import { describe, it, expect } from 'vitest'
import { VenuesDatasetSchema } from '../schema'

const validFixture = {
  generatedAt: '2026-04-29',
  venues: [
    {
      id: 'cvpr',
      name: 'CVPR',
      fullName: 'IEEE/CVF Conference on Computer Vision and Pattern Recognition',
      type: 'conference',
      topics: ['computer-vision'],
      website: 'https://cvpr.thecvf.com/',
      rankings: { core: 'A*', scopus: true },
      frequency: 'annual',
    },
  ],
}

describe('VenuesDatasetSchema', () => {
  it('accepts a valid dataset', () => {
    expect(() => VenuesDatasetSchema.parse(validFixture)).not.toThrow()
  })

  it('rejects an invalid id (uppercase)', () => {
    const bad = structuredClone(validFixture)
    bad.venues[0].id = 'CVPR'
    expect(() => VenuesDatasetSchema.parse(bad)).toThrow()
  })

  it('rejects an invalid url', () => {
    const bad = structuredClone(validFixture)
    bad.venues[0].website = 'not-a-url'
    expect(() => VenuesDatasetSchema.parse(bad)).toThrow()
  })

  it('rejects an invalid type', () => {
    const bad = structuredClone(validFixture)
    ;(bad.venues[0] as any).type = 'preprint'
    expect(() => VenuesDatasetSchema.parse(bad)).toThrow()
  })

  it('rejects acceptanceRate > 1', () => {
    const bad = structuredClone(validFixture)
    ;(bad.venues[0] as any).acceptanceRate = 24
    expect(() => VenuesDatasetSchema.parse(bad)).toThrow()
  })

  it('rejects malformed lastVerified', () => {
    const bad = structuredClone(validFixture)
    ;(bad.venues[0] as any).lastVerified = 'April 2026'
    expect(() => VenuesDatasetSchema.parse(bad)).toThrow()
  })
})
