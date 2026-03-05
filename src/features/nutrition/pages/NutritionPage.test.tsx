import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory } from 'history'
import { Route, Router } from 'react-router-dom'

import { createAppQueryClient } from '@/app/providers'
import { createNutritionMockDays } from '@/shared/services/mocks/nutritionMockData'
import { nutritionService } from '@/shared/services'
import { FqToastProvider } from '@/shared/ui'

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
      <FqToastProvider>
        <Router history={history}>
          <Route path={['/tabs/nutrition/meal/:mealId', '/tabs/nutrition/history', '/tabs/nutrition', '/nutrition/meal/:mealId', '/nutrition/history', '/nutrition']}>
            <NutritionPage />
          </Route>
        </Router>
      </FqToastProvider>
    </QueryClientProvider>,
  )

  return history
}

describe('NutritionPage V2', () => {
  beforeEach(() => {
    const today = toIsoDate(new Date())
    vi.spyOn(nutritionService, 'fetchDays').mockResolvedValue({
      daysByDate: createNutritionMockDays(today),
      permissions: {
        hasActiveNutritionist: true,
        canEditPlan: false,
        canRegisterConsumption: true,
      },
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders internal tabs and readonly plan', async () => {
    renderNutritionAt('/tabs/nutrition')

    await screen.findByRole('heading', { name: 'Nutricao' })

    expect(screen.getByRole('button', { name: 'Plano' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Registrar' }).length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'Aderencia' })).toBeInTheDocument()
    expect(screen.getByText('Plano do Nutricionista')).toBeInTheDocument()
    expect(screen.getByText('Somente leitura')).toBeInTheDocument()
  })

  it('opens adherence tab from history route', async () => {
    renderNutritionAt('/tabs/nutrition/history')

    await screen.findByRole('heading', { name: 'Nutricao' })
    expect(screen.getByText('Aderencia diaria')).toBeInTheDocument()
    expect(screen.getByText('Ultimos 7 dias')).toBeInTheDocument()
  })

  it('registers selected meal with quick logging flow', async () => {
    const today = toIsoDate(new Date())
    const days = createNutritionMockDays(today)
    const updatedDay = {
      ...days[today],
      meals: days[today].meals.map((meal) =>
        meal.id === 'breakfast'
          ? {
              ...meal,
              status: 'done' as const,
            }
          : meal,
      ),
    }

    vi.spyOn(nutritionService, 'updateMealStatus').mockResolvedValue(updatedDay)

    renderNutritionAt('/tabs/nutrition/meal/breakfast')

    await screen.findByText('Registro rapido')
    fireEvent.click(screen.getByRole('button', { name: '1.5x' }))
    fireEvent.change(screen.getByLabelText('Item extra (opcional)'), {
      target: { value: 'banana' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar registro' }))

    await waitFor(() => {
      expect(nutritionService.updateMealStatus).toHaveBeenCalledWith({
        date: today,
        mealId: 'breakfast',
        status: 'done',
      })
    })
  })
})
