import { render, screen } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'

import { createAppQueryClient } from '@/app/providers'
import { gamificationService, type GamificationOverview } from '@/shared/services'

import { GamificationPage } from './GamificationPage'

const overviewFixture: GamificationOverview = {
  level: 4,
  currentLevelXp: 220,
  nextLevelXp: 500,
  weeklyStreak: 2,
  weeklyXp: 640,
  weeklyXpTarget: 900,
  activityHeatmap: Array.from({ length: 14 }, (_, index) => ({
    date: `2026-02-${String(index + 15).padStart(2, '0')}`,
    value: index % 3,
  })),
  badges: [
    {
      id: 'first-session',
      title: 'Primeiro treino',
      description: 'Conclua sua primeira sessao.',
      icon: 'trophy',
      unlocked: true,
    },
    {
      id: 'consistency',
      title: 'Consistencia semanal',
      description: 'Complete 3 treinos na mesma semana.',
      icon: 'flame',
      unlocked: false,
    },
    {
      id: 'perfect-sets',
      title: 'Series perfeitas',
      description: 'Complete todas as series de uma sessao.',
      icon: 'target',
      unlocked: true,
    },
    {
      id: 'streak-runner',
      title: 'Streak runner',
      description: 'Mantenha 2 semanas seguidas com 2+ treinos.',
      icon: 'star',
      unlocked: true,
    },
  ],
}

function renderPage() {
  render(
    <QueryClientProvider client={createAppQueryClient()}>
      <GamificationPage />
    </QueryClientProvider>,
  )
}

describe('GamificationPage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders level, streak and badges', async () => {
    vi.spyOn(gamificationService, 'getOverview').mockResolvedValue(overviewFixture)

    renderPage()

    await screen.findByRole('heading', { name: 'Gamificacao' })

    expect(screen.getByText('Streak semanal: 2')).toBeInTheDocument()
    expect(screen.getByText('Primeiro treino')).toBeInTheDocument()
  })
})
