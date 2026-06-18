import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import MatchCard from '@/components/wc/MatchCard'
import type { Match } from '@/lib/wcTypes'

const base: Match = {
  id: 'm1',
  stage: 'group',
  group: 'A',
  kickoff: Date.UTC(2026, 5, 11, 19, 0, 0) / 1000,
  team1: 'Mexico',
  team2: 'Canada',
  ground: 'Estadio Azteca',
  score1: null,
  score2: null,
  status: 'upcoming',
}

describe('MatchCard', () => {
  it('renders score + points ✓ for a finished, correctly-picked match', () => {
    const m: Match = {
      ...base,
      status: 'finished',
      score1: 2,
      score2: 1,
      myPick: '1',
    }
    const { container } = render(<MatchCard match={m} mode="active" />)
    // final score appears (rendered as "2 – 1" within one node)
    expect(container.textContent).toContain('2')
    expect(container.textContent).toContain('1')
    expect(screen.getByText('✓')).toBeInTheDocument()
  })

  it('shows the login CTA for an upcoming match in view mode', () => {
    render(<MatchCard match={base} mode="view" />)
    expect(screen.getByText(/Đăng nhập để cược/)).toBeInTheDocument()
  })

  it('renders selectable 1X2 buttons for an upcoming match in betting mode', () => {
    render(<MatchCard match={base} mode="active" />)
    const btn1 = screen.getByRole('button', { name: 'Đội 1' })
    const btnX = screen.getByRole('button', { name: 'Hòa' })
    const btn2 = screen.getByRole('button', { name: 'Đội 2' })
    expect(btn1).toBeEnabled()
    expect(btnX).toBeEnabled()
    expect(btn2).toBeEnabled()
  })

  it('shows copy mode as a fourth selected option while keeping manual picks enabled', () => {
    render(<MatchCard match={{ ...base, copying: true, copyingFrom: 'Alice' }} mode="active" />)
    expect(screen.getByRole('button', { name: 'Đội 1' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Hòa' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Đội 2' })).toBeEnabled()
    const copy = screen.getByRole('button', { name: 'Copy' })
    expect(copy).toBeDisabled()
    expect(copy).toHaveAttribute('aria-pressed', 'true')
  })
})
