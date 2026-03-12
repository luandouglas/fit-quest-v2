import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory } from 'history'
import { Route, Router } from 'react-router-dom'

import { createAppQueryClient } from '@/app/providers'

import { RunPage } from './RunPage'

const mockUseRunDashboard = vi.fn()

vi.mock('../hooks/useRunDashboard', () => ({
  useRunDashboard: () => mockUseRunDashboard(),
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
  const history = createMemoryHistory({ initialEntries: ['/tabs/run'] })

  render(
    <QueryClientProvider client={createAppQueryClient()}>
      <Router history={history}>
        <Route path="/tabs/run">
          <RunPage />
        </Route>
      </Router>
    </QueryClientProvider>,
  )

  return history
}

describe('RunPage', () => {
  const dashboardMock = {
    overview: {
      activeSession: null,
      history: [
        {
          sessionId: 'run-1',
          activityType: 'run',
          startedAt: '2026-03-11T10:00:00.000Z',
          endedAt: '2026-03-11T10:28:00.000Z',
          status: 'completed',
          elapsedSec: 1680,
          distanceKm: 4.2,
          calories: 286,
          paceSecPerKm: 400,
          starsEarned: 42,
          progressImpactPct: 24,
          source: 'manual',
        },
      ],
      metrics: {
        totalKmMonth: 12.4,
        bestPaceSecPerKm: 390,
        totalCalories: 720,
        totalSessionsMonth: 4,
        weeklyDistanceKm: 8.2,
        weeklyStars: 68,
      },
      recommendedGoalKm: 4,
      todayDistanceKm: 4.2,
      todayStars: 42,
      streakDays: 3,
    },
    ranking: {
      points: 184,
      position: 12,
      totalAthletes: 120,
    },
    lastCompletedSession: null,
    isLoading: false,
    isError: false,
    error: null,
    refresh: vi.fn(),
    startRun: vi.fn().mockResolvedValue({
      sessionId: 'active-run',
      activityType: 'run',
      startedAt: '2026-03-11T12:00:00.000Z',
      status: 'active',
      elapsedSec: 0,
      distanceKm: 0,
      calories: 0,
      paceSecPerKm: 0,
      starsEarned: 0,
      progressImpactPct: 0,
      source: 'manual',
    }),
    updateRun: vi.fn(),
    finishRun: vi.fn(),
    isStartingRun: false,
    isUpdatingRun: false,
    isFinishingRun: false,
  }

  beforeEach(() => {
    mockUseRunDashboard.mockReturnValue(dashboardMock)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders history and starts a cardio session', async () => {
    const history = renderPage()

    expect(screen.getByRole('heading', { name: 'Corrida e caminhada contam de verdade no seu progresso' })).toBeInTheDocument()
    expect(screen.getByText('4.20 km')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Iniciar corrida' }))

    await waitFor(() => {
      expect(dashboardMock.startRun).toHaveBeenCalledWith({ activityType: 'run' })
      expect(history.location.pathname).toBe('/tabs/run/session')
    })
  })
})
