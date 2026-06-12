import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import PiggyBankTotal, { collectedTotal } from '@/components/wc/PiggyBankTotal'
import type { LeaderRow } from '@/lib/wcTypes'

const row = (name: string, vnd: number): LeaderRow => ({
  name,
  vnd,
  correct: 0,
  wrong: 0,
  missed: 0,
  finished: 0,
})

describe('PiggyBankTotal', () => {
  it('sums collected money from negative leaderboard money values', () => {
    expect(collectedTotal([row('A', -130_000), row('B', -30_000), row('C', 0)])).toBe(160_000)
  })

  it('renders the collected total as a positive VND amount', () => {
    render(<PiggyBankTotal rows={[row('A', -130_000), row('B', -30_000)]} />)
    expect(screen.getByText('Tổng đã thu')).toBeInTheDocument()
    expect(screen.getByText('160.000đ')).toBeInTheDocument()
  })

  it('uses the rich pig state at five million VND and above', () => {
    render(<PiggyBankTotal rows={[row('A', -5_000_000)]} />)
    expect(screen.getByLabelText('Heo đất sung túc')).toBeInTheDocument()
  })
})
