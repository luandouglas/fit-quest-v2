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
      restSec: 45,
      note: 'Controle a descida.',
      durationMin: 12,
      status: 'current',
      order: 1,
      iconName: 'target',
      supportMedia: null,
    },
    {
      id: 'shoulder-press',
      name: 'Shoulder Press',
      sets: 2,
      reps: 10,
      restSec: 45,
      note: 'Nao arqueie a lombar.',
      durationMin: 10,
      status: 'upcoming',
      order: 2,
      iconName: 'dumbbell',
      supportMedia: null,
    },
  ],
  setsDoneByExerciseId: {
    'bench-press': 0,
    'shoulder-press': 0,
  },
  totalElapsedSec: 0,
  restTimerSec: 45,
  currentExerciseId: 'bench-press',
  rewardStars: 30,
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
  rewardStars: 30,
  streakDays: 5,
  currentLevel: 3,
  nextLevel: 4,
  currentLevelStars: 75,
  nextLevelStars: 120,
  starsToNextLevel: 45,
  weeklyCompletedWorkouts: 3,
  weeklyTargetWorkouts: 4,
  weeklyCompletionDelta: 1,
  completionMessage: 'Treino concluido com bom ritmo.',
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

    fireEvent.click(screen.getAllByRole('button', { name: 'Iniciar sessao' })[0])

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: 'Pausar' }).length).toBeGreaterThan(0)
    })

    expect(workoutService.saveSessionProgress).toHaveBeenCalledTimes(1)
    expect(workoutService.saveSessionProgress).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionId: sessionFixture.sessionId,
        status: 'active',
      }),
    )
  })

  it('completes session and persists the workout result', async () => {
    renderPage()

    await screen.findByRole('heading', { name: 'Sessao de treino' })

    fireEvent.click(screen.getAllByRole('button', { name: 'Iniciar sessao' })[0])
    fireEvent.click(screen.getAllByRole('button', { name: 'Concluir série' })[0])
    fireEvent.click(screen.getAllByRole('button', { name: 'Concluir sessao' })[0])

    await waitFor(() => {
      expect(workoutService.completeSession).toHaveBeenCalledTimes(1)
    })
  })

  it('shows error state when session loading fails', async () => {
    vi.spyOn(workoutService, 'startSession').mockRejectedValueOnce(new Error('request failed'))

    renderPage()

    await screen.findByRole('alert')

    expect(screen.getByText('Falha ao carregar a sessao')).toBeInTheDocument()
    expect(screen.getByText('request failed')).toBeInTheDocument()
  })
})
