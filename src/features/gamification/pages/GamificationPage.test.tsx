import { render, screen } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'

import { createAppQueryClient } from '@/app/providers'
import { gamificationService, type GamificationOverview } from '@/shared/services'

import { GamificationPage } from './GamificationPage'

const overviewFixture: GamificationOverview = {
  level: 4,
  totalXp: 1820,
  currentLevelXp: 220,
  nextLevelXp: 500,
  weeklyStreak: 2,
  weeklyXp: 640,
  weeklyXpTarget: 900,
  todayXp: 180,
  xpBreakdown: {
    workout: 920,
    nutrition: 480,
    hydration: 160,
    run: 260,
    professional: 120,
    mission: 180,
    total: 1820,
  },
  dailyMissions: [
    {
      id: 'mission-train',
      title: 'Movimento do dia',
      description: 'Conclua 1 treino ou corrida hoje.',
      cadence: 'daily',
      current: 1,
      target: 1,
      rewardXp: 120,
      completed: true,
    },
    {
      id: 'mission-water',
      title: 'Meta de hidratacao',
      description: 'Atinja a meta diaria de agua.',
      cadence: 'daily',
      current: 1800,
      target: 2500,
      rewardXp: 40,
      completed: false,
    },
  ],
  weeklyMissions: [
    {
      id: 'mission-weekly-training-minutes',
      title: 'Volume de treino semanal',
      description: 'Acumule 180 min entre treino e corrida.',
      cadence: 'weekly',
      current: 140,
      target: 180,
      rewardXp: 220,
      completed: false,
      rewardBadgeId: 'consistency',
    },
  ],
  dailyResetAt: '2026-03-02T00:00:00.000Z',
  weeklyResetAt: '2026-03-09T00:00:00.000Z',
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
  achievementsByCategory: {
    WORKOUT: [
      {
        id: 'first-session',
        title: 'Primeiro treino',
        description: 'Conclua sua primeira sessao.',
        icon: 'trophy',
        unlocked: true,
        category: 'WORKOUT',
      },
    ],
    NUTRITION: [],
    HABIT: [],
    RUN: [],
  },
  xpLedger: [
    {
      id: 'workout-1',
      title: 'Treino concluido',
      description: 'Treino A',
      eventType: 'workout',
      xp: 120,
      occurredAt: '2026-03-01T10:00:00.000Z',
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

  it('renders level, streak, missions and ledger', async () => {
    vi.spyOn(gamificationService, 'getOverview').mockResolvedValue(overviewFixture)

    renderPage()

    await screen.findByRole('heading', { name: 'Gamificacao' })

    expect(screen.getByText('Streak semanal: 2')).toBeInTheDocument()
    expect(screen.getByText('Primeiro treino')).toBeInTheDocument()
    expect(screen.getAllByText('Missoes diarias').length).toBeGreaterThan(0)
    expect(screen.getByRole('heading', { name: 'Missoes semanais' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'XP Ledger' })).toBeInTheDocument()
  })
})
