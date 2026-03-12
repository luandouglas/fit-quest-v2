import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory } from 'history'
import { Route, Router } from 'react-router-dom'

import { createAppQueryClient } from '@/app/providers'
import { runService } from '@/shared/services'
import { FqToastProvider } from '@/shared/ui'

import { RunActivityPage } from './RunActivityPage'

const sessionFixture = {
  sessionId: 'cardio-1',
  activityType: 'walk' as const,
  startedAt: new Date().toISOString(),
  status: 'active' as const,
  elapsedSec: 300,
  distanceKm: 1.2,
  calories: 62,
  paceSecPerKm: 250,
  starsEarned: 0,
  progressImpactPct: 0,
  source: 'manual' as const,
}

function renderPage(state?: { activityType?: 'run' | 'walk' }) {
  const history = createMemoryHistory({ initialEntries: [{ pathname: '/tabs/run/session', state }] })

  render(
    <FqToastProvider>
      <QueryClientProvider client={createAppQueryClient()}>
        <Router history={history}>
          <Route path="/tabs/run/session">
            <RunActivityPage />
          </Route>
        </Router>
      </QueryClientProvider>
    </FqToastProvider>,
  )

  return history
}

describe('RunActivityPage', () => {
  beforeEach(() => {
    vi.spyOn(runService, 'startRun').mockResolvedValue(sessionFixture)
    vi.spyOn(runService, 'updateRunProgress').mockImplementation(async (session) => session)
    vi.spyOn(runService, 'finishRun').mockImplementation(async (session) => ({
      ...session,
      status: 'completed',
      endedAt: new Date().toISOString(),
      starsEarned: 24,
      progressImpactPct: 18,
    }))
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('starts the activity using the selected type from route state', async () => {
    renderPage({ activityType: 'walk' })

    await screen.findByRole('heading', { name: 'Caminhada em andamento' })

    expect(runService.startRun).toHaveBeenCalledWith({ activityType: 'walk' })
  })

  it('adds distance and persists progress', async () => {
    renderPage({ activityType: 'walk' })

    await screen.findByRole('heading', { name: 'Caminhada em andamento' })

    fireEvent.click(screen.getAllByRole('button', { name: '+0.25 km' })[0])

    await waitFor(() => {
      expect(runService.updateRunProgress).toHaveBeenCalled()
    })
  })
})
