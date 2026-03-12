import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { FqToastProvider } from '@/shared/ui'
import type { WaterProgress } from '@/shared/services/contracts/student'

import { StudentWaterQuickActionCard } from './StudentWaterQuickActionCard'

const waterProgress: WaterProgress = {
  status: 'in_progress',
  consumedMl: 900,
  targetMl: 2500,
  remainingMl: 1600,
  completionPct: 36,
  checkpointsCompleted: 1,
  checkpointsTotal: 5,
}

describe('StudentWaterQuickActionCard', () => {
  it('triggers quick water actions', async () => {
    const onAddWater = vi.fn().mockResolvedValue(undefined)

    render(
      <FqToastProvider>
        <StudentWaterQuickActionCard waterProgress={waterProgress} onAddWater={onAddWater} />
      </FqToastProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: '+300 ml' }))

    await waitFor(() => {
      expect(onAddWater).toHaveBeenCalledWith(300)
    })
  })

  it('submits a custom amount', async () => {
    const onAddWater = vi.fn().mockResolvedValue(undefined)

    render(
      <FqToastProvider>
        <StudentWaterQuickActionCard waterProgress={waterProgress} onAddWater={onAddWater} />
      </FqToastProvider>,
    )

    fireEvent.change(screen.getByLabelText('Quantidade em ml'), {
      target: { value: '450' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Registrar' }))

    await waitFor(() => {
      expect(onAddWater).toHaveBeenCalledWith(450)
    })
  })
})
