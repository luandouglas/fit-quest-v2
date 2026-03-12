import { type PropsWithChildren } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'

import { createAppQueryClient } from '@/app/providers'
import { nutritionService } from '@/shared/services'

import { useNutritionSummary } from './useNutritionSummary'

function createWrapper() {
  const queryClient = createAppQueryClient()

  return function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('useNutritionSummary', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns loading while request is pending', () => {
    vi.spyOn(nutritionService, 'fetchDays').mockImplementation(() => new Promise(() => undefined))

    const { result } = renderHook(
      () => useNutritionSummary({ anchorDate: '2026-03-01', selectedDate: '2026-03-01' }),
      { wrapper: createWrapper() },
    )

    expect(result.current.uiState).toBe('loading')
  })

  it('returns error when request fails', async () => {
    vi.spyOn(nutritionService, 'fetchDays').mockRejectedValue(new Error('network failed'))

    const { result } = renderHook(
      () => useNutritionSummary({ anchorDate: '2026-03-01', selectedDate: '2026-03-01' }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => {
      expect(result.current.uiState).toBe('error')
    })
  })
})
