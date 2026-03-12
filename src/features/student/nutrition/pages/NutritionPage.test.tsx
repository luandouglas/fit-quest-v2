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

function addDays(isoDate: string, offset: number) {
  const date = new Date(`${isoDate}T12:00:00`)
  date.setDate(date.getDate() + offset)
  return toIsoDate(date)
}

function renderNutritionAt(pathname: string) {
  const history = createMemoryHistory({ initialEntries: [pathname] })

  render(
    <QueryClientProvider client={createAppQueryClient()}>
      <FqToastProvider>
        <Router history={history}>
          <Route
            path={[
              '/tabs/nutrition/meal/:mealId',
              '/tabs/nutrition/history',
              '/tabs/nutrition',
              '/nutrition/meal/:mealId',
              '/nutrition/history',
              '/nutrition',
            ]}
          >
            <NutritionPage />
          </Route>
        </Router>
      </FqToastProvider>
    </QueryClientProvider>,
  )

  return history
}

describe('NutritionPage', () => {
  beforeEach(() => {
    const today = toIsoDate(new Date())
    vi.spyOn(nutritionService, 'fetchDays').mockResolvedValue({
      daysByDate: createNutritionMockDays(today),
      permissions: {
        hasActiveNutritionist: true,
        canEditPlan: false,
        canRegisterConsumption: true,
        canAddMealNotes: true,
        canUpdateWater: true,
      },
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the daily nutrition routine with all meals and actionable feedback', async () => {
    renderNutritionAt('/tabs/nutrition')

    await screen.findByRole('heading', { name: 'Nutrição' })

    expect(screen.getByText('Sua adesao alimentar de hoje')).toBeInTheDocument()
    expect(screen.getByText('Plano alimentar do dia')).toBeInTheDocument()
    expect(screen.getByText('Feedback acionavel')).toBeInTheDocument()
    expect(screen.getByText('Cafe da manha')).toBeInTheDocument()
    expect(screen.getByText('Almoco')).toBeInTheDocument()
    expect(screen.getByText('Lanche')).toBeInTheDocument()
    expect(screen.getByText('Jantar')).toBeInTheDocument()
    expect(screen.getByText('Ceia')).toBeInTheDocument()
  })

  it('saves a meal note from the meal detail route', async () => {
    const today = toIsoDate(new Date())
    const days = createNutritionMockDays(today)
    const updatedDay = {
      ...days[today],
      meals: days[today].meals.map((meal) =>
        meal.id === 'lunch'
          ? {
              ...meal,
              note: 'Troquei arroz por batata doce.',
            }
          : meal,
      ),
    }

    vi.spyOn(nutritionService, 'updateMeal').mockResolvedValue(updatedDay)

    renderNutritionAt('/tabs/nutrition/meal/lunch')

    await screen.findByDisplayValue('')

    fireEvent.change(screen.getByLabelText('Observacao'), {
      target: { value: 'Troquei arroz por batata doce.' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar observacao' }))

    await waitFor(() => {
      expect(nutritionService.updateMeal).toHaveBeenCalledWith({
        date: today,
        mealId: 'lunch',
        patch: { note: 'Troquei arroz por batata doce.' },
      })
    })
  })

  it('locks interactions when viewing a past day from history', async () => {
    const today = toIsoDate(new Date())
    const yesterday = addDays(today, -1)

    renderNutritionAt(`/tabs/nutrition/history?date=${yesterday}`)

    await screen.findByText('Historico em modo leitura')

    expect(screen.getAllByRole('button', { name: 'Pular' })[0]).toBeDisabled()
    expect(screen.getAllByRole('button', { name: '+300 ml' })[0]).toBeDisabled()
  })
})
