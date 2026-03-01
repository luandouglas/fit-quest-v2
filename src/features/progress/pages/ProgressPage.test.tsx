import { render, screen } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'

import { createAppQueryClient } from '@/app/providers'
import { progressService, type ProgressOverview } from '@/shared/services'

import { ProgressPage } from './ProgressPage'

const overviewFixture: ProgressOverview = {
  weeklySummary: {
    completedTrainings: 3,
    targetTrainings: 5,
    totalDurationMin: 165,
    averageCompletionPct: 86,
  },
  chart: [
    { date: '2026-02-23', completedTrainings: 1, durationMin: 55 },
    { date: '2026-02-24', completedTrainings: 0, durationMin: 0 },
    { date: '2026-02-25', completedTrainings: 1, durationMin: 52 },
    { date: '2026-02-26', completedTrainings: 0, durationMin: 0 },
    { date: '2026-02-27', completedTrainings: 0, durationMin: 0 },
    { date: '2026-02-28', completedTrainings: 1, durationMin: 58 },
    { date: '2026-03-01', completedTrainings: 0, durationMin: 0 },
  ],
  recentHistory: [
    {
      sessionId: 'session-1',
      title: 'Upper Body Day',
      completedAt: '2026-03-01T10:00:00.000Z',
      durationSec: 3200,
      completedSets: 12,
      totalSets: 14,
    },
  ],
}

function renderPage() {
  render(
    <QueryClientProvider client={createAppQueryClient()}>
      <ProgressPage />
    </QueryClientProvider>,
  )
}

describe('ProgressPage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders weekly summary and history', async () => {
    vi.spyOn(progressService, 'getOverview').mockResolvedValue(overviewFixture)

    renderPage()

    await screen.findByRole('heading', { name: 'Progresso' })

    expect(screen.getByText('Historico recente')).toBeInTheDocument()
    expect(screen.getByText('Upper Body Day')).toBeInTheDocument()
  })

  it('renders error state when service fails', async () => {
    vi.spyOn(progressService, 'getOverview').mockRejectedValue(new Error('network error'))

    renderPage()

    await screen.findByRole('alert')

    expect(screen.getByText('Falha ao carregar progresso')).toBeInTheDocument()
  })
})
