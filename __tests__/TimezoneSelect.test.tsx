import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import TimezoneSelect from '@/components/wc/TimezoneSelect'

describe('TimezoneSelect', () => {
  it('shows the selected timezone, marks the detected timezone, and emits changes', () => {
    const onChange = vi.fn()
    render(
      <TimezoneSelect
        value="Asia/Ho_Chi_Minh"
        detectedTimeZone="Asia/Ho_Chi_Minh"
        onChange={onChange}
      />,
    )

    const select = screen.getByLabelText('Múi giờ')
    expect(select).toHaveValue('Asia/Ho_Chi_Minh')
    expect(screen.getByText('Asia/Ho_Chi_Minh (thiết bị)')).toBeInTheDocument()

    fireEvent.change(select, { target: { value: 'America/New_York' } })
    expect(onChange).toHaveBeenCalledWith('America/New_York')
  })
})
