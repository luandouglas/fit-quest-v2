import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory } from 'history'
import { Route, Router } from 'react-router-dom'

import { createAppQueryClient } from '@/app/providers'
import { workoutService, type WorkoutSession, type WorkoutSessionSummary } from '@/shared/services'
import { FqToastProvider } from '@/shared/ui'

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
  loadVolumeKg: 960,
  exerciseRecords: [
    {
      exerciseId: 'bench-press',
      exerciseName: 'Bench Press',
      loadVolumeKg: 720,
    },
    {
      exerciseId: 'shoulder-press',
      exerciseName: 'Shoulder Press',
      loadVolumeKg: 240,
    },
  ],
}

function renderPage(state?: { workoutId?: string }) {
  const history = createMemoryHistory({ initialEntries: [{ pathname: '/treinos/sessao', state }] })

  render(
    <FqToastProvider>
      <QueryClientProvider client={createAppQueryClient()}>
        <Router history={history}>
          <Route path="/treinos/sessao">
            <TrainingSessionPage />
          </Route>
        </Router>
      </QueryClientProvider>
    </FqToastProvider>,
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

    expect(workoutService.startSession).toHaveBeenCalledTimes(1)
    expect(screen.getAllByText('1. Bench Press').length).toBeGreaterThan(0)
    expect(screen.getAllByText('2. Shoulder Press').length).toBeGreaterThan(0)
  })

  it('starts session using selected workout id from route state', async () => {
    renderPage({ workoutId: 'workout-123' })

    await screen.findByRole('heading', { name: 'Sessao de treino' })

    expect(workoutService.startSession).toHaveBeenCalledWith({ workoutId: 'workout-123' })
  })

  it('starts session and persists execution state', async () => {
    renderPage()

    await screen.findByRole('heading', { name: 'Sessao de treino' })

    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sessao' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Pausar' })).toBeInTheDocument()
    })

    expect(workoutService.saveSessionProgress).toHaveBeenCalledTimes(1)
    expect(workoutService.saveSessionProgress).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionId: sessionFixture.sessionId,
        status: 'active',
      }),
    )
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

  it('shows error state when session loading fails', async () => {
    vi.spyOn(workoutService, 'startSession').mockRejectedValueOnce(new Error('request failed'))

    renderPage()

    await screen.findByRole('alert')

    expect(screen.getByText('Falha ao carregar a sessao')).toBeInTheDocument()
    expect(screen.getByText('request failed')).toBeInTheDocument()
  })
})
