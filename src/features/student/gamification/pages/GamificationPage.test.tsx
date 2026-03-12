import { render, screen } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'

import { createAppQueryClient } from '@/app/providers'
import {
  gamificationService,
  studentService,
  type GamificationOverview,
  type StudentDashboard,
} from '@/shared/services'
import { FqToastProvider } from '@/shared/ui'

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
      id: 'mission-water',
      title: 'Meta de hidratacao',
      description: 'Atinja a meta diaria de agua.',
      cadence: 'daily',
      current: 1800,
      target: 2500,
      rewardXp: 40,
      completed: false,
    },
    {
      id: 'mission-meal',
      title: 'Plano alimentar fechado',
      description: 'Conclua todas as refeicoes planejadas.',
      cadence: 'daily',
      current: 4,
      target: 5,
      rewardXp: 60,
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
  dailyResetAt: '2026-03-12T00:00:00.000Z',
  weeklyResetAt: '2026-03-16T00:00:00.000Z',
  activityHeatmap: Array.from({ length: 14 }, (_, index) => ({
    date: `2026-03-${String(index + 1).padStart(2, '0')}`,
    value: index % 4,
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
      occurredAt: '2026-03-11T10:00:00.000Z',
    },
    {
      id: 'water-1',
      title: 'Meta de agua em progresso',
      description: 'Registro de 500 ml',
      eventType: 'hydration',
      xp: 20,
      occurredAt: '2026-03-11T11:00:00.000Z',
    },
  ],
}

const dashboardFixture: StudentDashboard = {
  profile: {
    id: 'student-1',
    firstName: 'Luan',
    fullName: 'Luan Douglas',
    city: 'Fortaleza',
    neighborhood: 'Aldeota',
    gym: 'FitQuest Club',
    memberSince: '2025-01-05',
    primaryGoal: 'Ganhar consistencia',
    headline: 'Treino, nutricao e cardio em rotina',
    supportTeam: [
      {
        id: 'coach-1',
        role: 'PERSONAL',
        name: 'Coach Diego',
      },
    ],
  },
  dailyProgress: {
    date: '2026-03-11',
    status: 'in_progress',
    completionPct: 68,
    completedBlocks: 3,
    totalBlocks: 5,
    starsEarned: 42,
    xpEarned: 180,
    streakDays: 7,
    streakStatus: 'hot',
    focusLabel: 'Fechar treino e agua',
  },
  todayWorkout: {
    id: 'workout-a',
    date: '2026-03-11',
    title: 'Treino A',
    focus: 'Peito e triceps',
    status: 'scheduled',
    estimatedDurationMin: 48,
    completionPct: 0,
    rewardStars: 25,
    coachNote: 'Priorize amplitude.',
    exercises: [
      {
        id: 'ex-1',
        name: 'Supino reto',
        group: 'Peito',
        sets: 4,
        reps: 10,
        restSec: 90,
        suggestedLoadKg: 30,
        status: 'pending',
      },
    ],
  },
  cardioSession: {
    id: 'run-1',
    date: '2026-03-11',
    title: 'Corrida leve',
    type: 'run',
    status: 'scheduled',
    intensity: 'moderate',
    goalDurationMin: 30,
    completedDurationMin: 0,
    targetDistanceKm: 4,
  },
  nutritionPlan: {
    date: '2026-03-11',
    status: 'in_progress',
    adherencePct: 80,
    caloriesTarget: 2100,
    caloriesConsumed: 1680,
    proteinTargetG: 160,
    proteinConsumedG: 128,
    carbsTargetG: 220,
    carbsConsumedG: 180,
    fatTargetG: 70,
    fatConsumedG: 54,
    meals: [
      {
        id: 'breakfast',
        name: 'Cafe da manha',
        scheduledAt: '07:00',
        status: 'completed',
        itemsSummary: 'Ovos e tapioca',
        targetCalories: 450,
        consumedCalories: 430,
        rewardStars: 8,
      },
      {
        id: 'lunch',
        name: 'Almoco',
        scheduledAt: '12:00',
        status: 'pending',
        itemsSummary: 'Arroz, frango e legumes',
        targetCalories: 650,
        consumedCalories: 0,
        rewardStars: 10,
      },
    ],
  },
  waterProgress: {
    status: 'in_progress',
    consumedMl: 1800,
    targetMl: 2500,
    remainingMl: 700,
    completionPct: 72,
    checkpointsCompleted: 3,
    checkpointsTotal: 5,
  },
  gamificationProfile: {
    level: 4,
    totalXp: 1820,
    currentLevelXp: 220,
    nextLevelXp: 500,
    weeklyXp: 640,
    weeklyXpTarget: 900,
    stars: 320,
    streakDays: 7,
    streakStatus: 'hot',
  },
  achievements: [
    {
      id: 'first-workout',
      title: 'Primeiro treino concluido',
      description: 'Conclua seu primeiro treino.',
      category: 'workout',
      status: 'unlocked',
      icon: 'trophy',
      currentProgress: 1,
      targetProgress: 1,
      rewardStars: 10,
      rewardXp: 120,
      unlockedAt: '2026-02-21T10:00:00.000Z',
    },
    {
      id: 'streak-7',
      title: '7 dias seguidos',
      description: 'Mantenha 7 dias de consistencia.',
      category: 'consistency',
      status: 'unlocked',
      icon: 'flame',
      currentProgress: 7,
      targetProgress: 7,
      rewardStars: 20,
      rewardXp: 200,
      unlockedAt: '2026-03-11T08:00:00.000Z',
    },
    {
      id: 'water-7',
      title: 'Meta de agua por 7 dias',
      description: 'Bata a meta de agua por 7 dias.',
      category: 'hydration',
      status: 'in_progress',
      icon: 'star',
      currentProgress: 5,
      targetProgress: 7,
      rewardStars: 15,
      rewardXp: 120,
    },
  ],
  rankingSummary: {
    scope: 'gym',
    period: 'weekly',
    league: 'gold',
    position: 4,
    totalParticipants: 128,
    points: 1180,
    gapToNext: 35,
    gapToLeader: 180,
    trend: 'up',
    lastUpdatedAt: '2026-03-11T09:00:00.000Z',
  },
  metrics: {
    workoutsCompletedMonth: 14,
    nutritionAdherencePct: 82,
    cardioMinutesMonth: 160,
    averageWaterMl: 2350,
    currentWeightKg: 78.4,
    consistencyScore: 88,
  },
  goals: [],
  habits: [],
  quickActions: [],
}

function renderPage() {
  render(
    <FqToastProvider>
      <QueryClientProvider client={createAppQueryClient()}>
        <GamificationPage />
      </QueryClientProvider>
    </FqToastProvider>,
  )
}

describe('GamificationPage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders stars, ranking, achievements and next objectives', async () => {
    vi.spyOn(gamificationService, 'getOverview').mockResolvedValue(overviewFixture)
    vi.spyOn(studentService, 'getDashboard').mockResolvedValue(dashboardFixture)

    renderPage()

    await screen.findByRole('heading', { name: 'Gamificação' })

    expect(screen.getAllByText('320 estrelas').length).toBeGreaterThan(0)
    expect(screen.getByText('Ranking')).toBeInTheDocument()
    expect(screen.getAllByText('Primeiro treino concluido').length).toBeGreaterThan(0)
    expect(screen.getByText('Meta de hidratacao')).toBeInTheDocument()
    expect(screen.getByText('Recompensas simbolicas')).toBeInTheDocument()
    expect(screen.getByText('Feed de ganhos')).toBeInTheDocument()
  })
})
