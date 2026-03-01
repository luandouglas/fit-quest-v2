import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory } from 'history'
import { Route, Router } from 'react-router-dom'

import { createAppQueryClient } from '@/app/providers'
import { createNutritionMockDays } from '@/shared/services/mocks/nutritionMockData'
import { nutritionService } from '@/shared/services'

import { NutritionPage } from './NutritionPage'

function toIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function renderNutritionAt(pathname: string) {
  const history = createMemoryHistory({ initialEntries: [pathname] })

  render(
    <QueryClientProvider client={createAppQueryClient()}>
      <Router history={history}>
        <Route path={['/tabs/nutrition/meal/:mealId', '/tabs/nutrition/history', '/tabs/nutrition', '/nutrition/meal/:mealId', '/nutrition/history', '/nutrition']}>
          <NutritionPage />
        </Route>
      </Router>
    </QueryClientProvider>,
  )

  return history
}

describe('NutritionPage routes', () => {
  beforeEach(() => {
    const today = toIsoDate(new Date())
    vi.spyOn(nutritionService, 'fetchDays').mockResolvedValue(createNutritionMockDays(today))
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders nutrition page at base route', async () => {
    const history = renderNutritionAt('/tabs/nutrition')

    await screen.findByRole('heading', { name: 'Nutricao' })

    expect(history.location.pathname).toBe('/tabs/nutrition')
  })

  it('keeps history route and can navigate back to plan route', async () => {
    const history = renderNutritionAt('/tabs/nutrition/history')

    await screen.findByRole('heading', { name: 'Nutricao' })
    await screen.findByRole('button', { name: 'Plano' })
    expect(history.location.pathname).toBe('/tabs/nutrition/history')

    fireEvent.click(screen.getByRole('button', { name: 'Plano' }))

    await waitFor(() => {
      expect(history.location.pathname).toBe('/tabs/nutrition')
    })
  })

  it('opens meal detail sheet when route contains meal id', async () => {
    const history = renderNutritionAt('/tabs/nutrition/meal/breakfast')

    await screen.findByText('Plano somente leitura')

    expect(history.location.pathname).toBe('/tabs/nutrition/meal/breakfast')
  })
})
