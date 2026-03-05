import { render, screen } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory } from 'history'
import { Route, Router } from 'react-router-dom'

import { createAppQueryClient } from '@/app/providers'
import { TrainingPlanPage } from './TrainingPlanPage'

const mockUseTrainingPlanState = vi.fn()

vi.mock('./hooks/useTrainingPlanState', () => ({
  useTrainingPlanState: () => mockUseTrainingPlanState(),
}))

vi.mock('@/shared/ui', async () => {
  const actual = await vi.importActual<typeof import('@/shared/ui')>('@/shared/ui')
  return {
    ...actual,
    useToast: () => ({
      toast: vi.fn(),
    }),
  }
})

function renderPage() {
  const history = createMemoryHistory({ initialEntries: ['/tabs/workouts'] })

  render(
    <QueryClientProvider client={createAppQueryClient()}>
      <Router history={history}>
        <Route path="/tabs/workouts">
          <TrainingPlanPage />
        </Route>
      </Router>
    </QueryClientProvider>,
  )
}

describe('TrainingPlanPage permissions', () => {
  beforeEach(() => {
    mockUseTrainingPlanState.mockReturnValue({
      uiState: 'ready',
      week: [{ date: '2026-03-01', weekday: 'Dom', isToday: true, isCompleted: false, hasWorkout: false, status: 'rest' }],
      selectedDate: '2026-03-01',
      selectedDay: { date: '2026-03-01', weekday: 'Dom', isToday: true, isCompleted: false, hasWorkout: false, status: 'rest' },
      selectedDateWorkouts: [],
      hasWorkoutToday: false,
      exercises: [],
      permissions: {
        hasActivePersonal: true,
        canCreateQuickWorkout: false,
        canExecuteOnlyAssigned: true,
        canEditPlan: false,
      },
      progressPct: 0,
      todayWorkout: {
        title: 'Nenhum treino planejado',
        durationMin: 0,
        calories: 0,
        stars: 0,
        progressPct: 0,
        completedCount: 0,
        totalCount: 0,
      },
      totalDurationMin: 0,
      isStarted: false,
      isUpdatingExercise: false,
      isCreatingQuickWorkout: false,
      setSelectedDate: vi.fn(),
      setCurrentExercise: vi.fn(),
      toggleExerciseDone: vi.fn(),
      createQuickWorkout: vi.fn(),
      retryLoad: vi.fn(),
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('disables quick workout creation for students with active personal trainer', async () => {
    renderPage()

    const quickButtons = await screen.findAllByRole('button', { name: 'Criar treino rapido' })
    quickButtons.forEach((button) => {
      expect(button).toBeDisabled()
    })
    expect(screen.getAllByText('Treino rapido bloqueado para aluno com personal ativo.').length).toBeGreaterThan(0)
  })
})
