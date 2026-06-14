import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import MatchPicksBreakdown from '@/components/wc/MatchPicksBreakdown'
import type { Match } from '@/lib/wcTypes'

const base: Match = {
  id: 'm1',
  stage: 'group',
  group: 'A',
  kickoff: 1_700_000_000,
  team1: 'Mexico',
  team2: 'South Africa',
  ground: 'Estadio',
  score1: 2,
  score2: 0,
  status: 'finished',
  picks: [
    { name: 'Ann', pick: '1' },
    { name: 'Bob', pick: 'X' },
    { name: 'Cy', pick: '1' },
    { name: 'Dy', pick: '2' },
  ],
}

describe('MatchPicksBreakdown', () => {
  afterEach(cleanup)

  it('renders nothing until the match is finished', () => {
    const { container } = render(<MatchPicksBreakdown match={{ ...base, status: 'upcoming', picks: undefined }} />)
    expect(container.firstChild).toBeNull()
  })

  it('shows the total and per-outcome counts, then names once expanded', () => {
    render(<MatchPicksBreakdown match={base} />)
    // Summary shows the total picker count.
    expect(screen.getByText(/Ai chọn gì \(4\)/)).toBeInTheDocument()
    // Names hidden until expanded.
    expect(screen.queryByText('Ann')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button'))
    // All four pickers now listed under their chosen outcome.
    expect(screen.getByText('Ann')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('Cy')).toBeInTheDocument()
    expect(screen.getByText('Dy')).toBeInTheDocument()
  })

  it('handles a finished match no one picked', () => {
    render(<MatchPicksBreakdown match={{ ...base, picks: [] }} />)
    expect(screen.getByText('Không ai chọn trận này')).toBeInTheDocument()
  })
})
