import { render, screen } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'

import { createAppQueryClient } from '@/app/providers'
import {
  notificationsPushRuntimeService,
  notificationsService,
  profileService,
  progressService,
  relationshipService,
  studentService,
  type ProfileSettings,
  type ProgressOverview,
  type StudentDashboard,
} from '@/shared/services'
import type { NotificationPushState, NotificationsInbox } from '@/shared/services/contracts/notifications'
import type { StudentRelationshipsOverview } from '@/shared/services/contracts/relationship'
import { FqToastProvider } from '@/shared/ui'

import { ProfilePage } from './ProfilePage'

vi.mock('@/shared/hooks', () => ({
  useRole: () => ({
    role: 'STUDENT',
    isStudent: true,
    isPersonal: false,
    isNutritionist: false,
    hasRole: (roles: Array<'STUDENT' | 'PERSONAL' | 'NUTRITIONIST'>) => roles.includes('STUDENT'),
  }),
  useAuth: () => ({
    updateUser: vi.fn(),
  }),
}))

const profileFixture: ProfileSettings = {
  name: 'Luan Douglas',
  city: 'Fortaleza',
  neighborhood: 'Aldeota',
  gym: 'FitQuest Club',
  goal: 'performance',
  goals: {
    waterMlDaily: 2500,
    workoutsPerWeek: 5,
  },
  preferences: {
    notificationsEnabled: true,
    remindersEnabled: true,
    measurementSystem: 'metric',
    themePreference: 'system',
  },
}

const studentDashboardFixture: StudentDashboard = {
  profile: {
    id: 'student-1',
    firstName: 'Luan',
    fullName: 'Luan Douglas',
    avatarUrl: undefined,
    city: 'Fortaleza',
    neighborhood: 'Aldeota',
    gym: 'FitQuest Club',
    memberSince: '2025-01-05',
    primaryGoal: 'Performance',
    headline: 'Constancia com treino, cardio e nutricao',
    supportTeam: [],
  },
  dailyProgress: {
    date: '2026-03-11',
    status: 'in_progress',
    completionPct: 70,
    completedBlocks: 3,
    totalBlocks: 5,
    starsEarned: 42,
    xpEarned: 180,
    streakDays: 7,
    streakStatus: 'hot',
    focusLabel: 'Fechar treino e agua',
  },
  todayWorkout: null,
  cardioSession: null,
  nutritionPlan: {
    date: '2026-03-11',
    status: 'in_progress',
    adherencePct: 82,
    caloriesTarget: 2100,
    caloriesConsumed: 1650,
    proteinTargetG: 160,
    proteinConsumedG: 130,
    carbsTargetG: 220,
    carbsConsumedG: 175,
    fatTargetG: 70,
    fatConsumedG: 52,
    meals: [],
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
  ],
  rankingSummary: {
    scope: 'gym',
    period: 'weekly',
    league: 'gold',
    position: 4,
    totalParticipants: 120,
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

const progressFixture: ProgressOverview = {
  range: '30d',
  monthSummary: {
    completedWorkouts: 12,
    totalTrainingMin: 520,
    completedRuns: 5,
    totalRunKm: 27.4,
    hydrationAdherencePct: 74,
    nutritionConsistencyPct: 69,
    activeDays: 19,
  },
  weeklySummary: {
    completedTrainings: 4,
    targetTrainings: 5,
    totalDurationMin: 170,
    averageCompletionPct: 88,
    completedRuns: 2,
    nutritionConsistencyPct: 71,
    waterAdherencePct: 57,
    activeDays: 5,
  },
  metrics: {
    currentWeightKg: 78.4,
    weightDeltaKg: -0.6,
    workoutsPerWeek: 3.5,
    avgWaterMl: 2350,
    estimatedCalories: 1940,
    heightCm: 178,
    bmi: 24.7,
  },
  bodyComposition: {
    heightCm: 178,
    bmi: 24.7,
    bmiStatus: 'healthy',
    latestMeasurements: {
      chestCm: 100,
      waistCm: 82,
      hipsCm: 96,
      armCm: 35,
      thighCm: 57,
    },
    previousMeasurements: {
      chestCm: 99,
      waistCm: 84,
      hipsCm: 97,
      armCm: 34.5,
      thighCm: 56.5,
    },
  },
  comparisons: {
    weekly: {
      workouts: { current: 4, previous: 3, deltaValue: 1, deltaPct: 33, trend: 'up' },
      cardioSessions: { current: 2, previous: 1, deltaValue: 1, deltaPct: 100, trend: 'up' },
      nutritionConsistencyPct: { current: 71, previous: 60, deltaValue: 11, deltaPct: 18, trend: 'up' },
      waterAdherencePct: { current: 57, previous: 71, deltaValue: -14, deltaPct: -20, trend: 'down' },
    },
    monthly: {
      trainingMin: { current: 520, previous: 460, deltaValue: 60, deltaPct: 13, trend: 'up' },
      cardioDistanceKm: { current: 27.4, previous: 21.2, deltaValue: 6.2, deltaPct: 29, trend: 'up' },
      activeDays: { current: 19, previous: 16, deltaValue: 3, deltaPct: 19, trend: 'up' },
    },
  },
  strengthPrs: [],
  strengthWeeklyVolume: [],
  weightTrend: {
    trend7dKg: -0.3,
    trend30dKg: -0.6,
  },
  measurementSummary: {
    lastUpdatedAt: '2026-03-09T08:05:00.000Z',
    lastUpdatedByLabel: 'Nutri FitQuest',
  },
  insights: ['Consistencia em alta. Continue com a mesma disciplina.'],
  chart: [],
  weightHistory: [],
  weightLogs: [],
  bodyMeasurementLogs: [],
  recentHistory: [],
  cardioHistory: [],
}

const relationshipsFixture: StudentRelationshipsOverview = {
  studentId: 'student-1',
  personal: {
    id: 'personal-1',
    role: 'PERSONAL',
    name: 'Coach Diego',
    code: 'PT-DIEGO',
    linkedAt: '2026-02-01T09:00:00.000Z',
  },
  nutritionist: {
    id: 'nutritionist-1',
    role: 'NUTRITIONIST',
    name: 'Nutri Bianca',
    code: 'NT-BIANCA',
    linkedAt: '2026-02-03T09:00:00.000Z',
  },
  pendingInvites: [],
  recentInvites: [],
}

const notificationsFixture: NotificationsInbox = {
  unreadCount: 2,
  items: [
    {
      id: 'notification-1',
      entityKey: 'workout-2026-03-11',
      title: 'Treino pendente',
      description: 'Seu treino principal ainda nao foi iniciado.',
      at: '2026-03-11T10:00:00.000Z',
      type: 'workout',
      trigger: 'workout_pending',
      urgency: 'attention',
      origin: 'workout',
      channels: ['in_app'],
      read: false,
    },
    {
      id: 'notification-2',
      entityKey: 'achievement-2026-03-11',
      title: 'Nova conquista',
      description: 'Voce desbloqueou uma nova conquista.',
      at: '2026-03-11T09:00:00.000Z',
      type: 'gamification',
      trigger: 'achievement_unlocked',
      urgency: 'celebration',
      origin: 'gamification',
      channels: ['in_app'],
      read: false,
    },
  ],
}

const pushStateFixture: NotificationPushState = {
  permission: 'prompt',
  platform: 'web',
  isRegistered: false,
  token: null,
}

function renderPage() {
  render(
    <FqToastProvider>
      <QueryClientProvider client={createAppQueryClient()}>
        <ProfilePage />
      </QueryClientProvider>
    </FqToastProvider>,
  )
}

describe('ProfilePage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders profile hub sections with professionals and achievements', async () => {
    vi.spyOn(profileService, 'getProfile').mockResolvedValue(profileFixture)
    vi.spyOn(studentService, 'getDashboard').mockResolvedValue(studentDashboardFixture)
    vi.spyOn(progressService, 'getOverview').mockResolvedValue(progressFixture)
    vi.spyOn(relationshipService, 'getMyRelationships').mockResolvedValue(relationshipsFixture)
    vi.spyOn(notificationsService, 'getInbox').mockResolvedValue(notificationsFixture)
    vi.spyOn(notificationsPushRuntimeService, 'getState').mockResolvedValue(pushStateFixture)

    renderPage()

    await screen.findByRole('heading', { name: 'Perfil' })

    expect(screen.getByText('Luan Douglas')).toBeInTheDocument()
    expect(screen.getByText('Profissionais vinculados')).toBeInTheDocument()
    expect(screen.getByText('Alertas, lembretes e notificacoes')).toBeInTheDocument()
    expect(screen.getByText('Coach Diego')).toBeInTheDocument()
    expect(screen.getByText('Conquistas em destaque')).toBeInTheDocument()
    expect(screen.getAllByText('Primeiro treino concluido').length).toBeGreaterThan(0)
  })
})
