import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import { Route, Router } from 'react-router-dom'

import { workoutService, type WorkoutSession, type WorkoutSessionSummary } from '@/shared/services'

import { TrainingSessionPage } from './TrainingSessionPage'

const sessionFixture: WorkoutSession = {
  sessionId: 'session-1',
  startedAt: new Date().toISOString(),
  status: 'active',
  title: 'Upper Body Day',
  exercises: [
    {
      id: 'bench-press',
      name: 'Bench Press',
      sets: 2,
      reps: 12,
      durationMin: 12,
      status: 'current',
      order: 1,
      iconName: 'target',
    },
    {
      id: 'shoulder-press',
      name: 'Shoulder Press',
      sets: 2,
      reps: 10,
      durationMin: 10,
      status: 'upcoming',
      order: 2,
      iconName: 'dumbbell',
    },
  ],
  setsDoneByExerciseId: {
    'bench-press': 0,
    'shoulder-press': 0,
  },
  totalElapsedSec: 0,
  restTimerSec: 45,
}

const summaryFixture: WorkoutSessionSummary = {
  sessionId: 'session-1',
  title: 'Upper Body Day',
  startedAt: new Date().toISOString(),
  completedAt: new Date().toISOString(),
  durationSec: 420,
  totalExercises: 2,
  completedExercises: 1,
  totalSets: 4,
  completedSets: 2,
}

function renderPage() {
  const history = createMemoryHistory({ initialEntries: ['/treinos/sessao'] })

  render(
    <Router history={history}>
      <Route path="/treinos/sessao">
        <TrainingSessionPage />
      </Route>
    </Router>,
  )

  return history
}

describe('TrainingSessionPage', () => {
  beforeEach(() => {
    vi.spyOn(workoutService, 'startSession').mockResolvedValue(sessionFixture)
    vi.spyOn(workoutService, 'saveSessionProgress').mockImplementation(async (session) => session)
    vi.spyOn(workoutService, 'completeSession').mockResolvedValue(summaryFixture)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders loaded session exercises', async () => {
    renderPage()

    await screen.findByRole('heading', { name: 'Sessao de treino' })

    expect(screen.getByText('1. Bench Press')).toBeInTheDocument()
    expect(screen.getByText('2. Shoulder Press')).toBeInTheDocument()
  })

  it('completes session and shows summary modal', async () => {
    renderPage()

    await screen.findByRole('heading', { name: 'Sessao de treino' })

    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sessao' }))
    fireEvent.click(screen.getAllByRole('button', { name: 'Concluir serie' })[0])
    fireEvent.click(screen.getByRole('button', { name: 'Concluir sessao' }))

    await waitFor(() => {
      expect(screen.getByText('Resumo da sessao')).toBeInTheDocument()
    })

    expect(workoutService.completeSession).toHaveBeenCalledTimes(1)
  })
})
