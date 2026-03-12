import { render, screen } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'

import { createAppQueryClient } from '@/app/providers'
import { progressService, studentService, type ProgressOverview, type StudentDashboard } from '@/shared/services'
import { FqToastProvider } from '@/shared/ui'

import { ProgressPage } from './ProgressPage'

vi.mock('@/shared/hooks', () => ({
  useRole: () => ({
    role: 'STUDENT',
    isStudent: true,
    isPersonal: false,
    isNutritionist: false,
    hasRole: (roles: Array<'STUDENT' | 'PERSONAL' | 'NUTRITIONIST'>) => roles.includes('STUDENT'),
  }),
}))

const overviewFixture: ProgressOverview = {
  range: '7d',
  monthSummary: {
    completedWorkouts: 9,
    totalTrainingMin: 420,
    completedRuns: 4,
    totalRunKm: 21.4,
    hydrationAdherencePct: 72,
    nutritionConsistencyPct: 68,
    activeDays: 18,
  },
  weeklySummary: {
    completedTrainings: 3,
    targetTrainings: 5,
    totalDurationMin: 165,
    averageCompletionPct: 86,
    completedRuns: 2,
    nutritionConsistencyPct: 71,
    waterAdherencePct: 57,
    activeDays: 5,
  },
  metrics: {
    currentWeightKg: 82.1,
    weightDeltaKg: -0.4,
    workoutsPerWeek: 3,
    avgWaterMl: 2200,
    estimatedCalories: 1840,
    heightCm: 178,
    bmi: 25.9,
  },
  bodyComposition: {
    heightCm: 178,
    bmi: 25.9,
    bmiStatus: 'overweight',
    latestMeasurements: {
      chestCm: 98,
      waistCm: 84,
      hipsCm: 97,
      armCm: 34,
      thighCm: 56,
    },
    previousMeasurements: {
      chestCm: 99,
      waistCm: 85,
      hipsCm: 98,
      armCm: 33.5,
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
      trainingMin: { current: 420, previous: 360, deltaValue: 60, deltaPct: 17, trend: 'up' },
      cardioDistanceKm: { current: 21.4, previous: 18.2, deltaValue: 3.2, deltaPct: 18, trend: 'up' },
      activeDays: { current: 18, previous: 15, deltaValue: 3, deltaPct: 20, trend: 'up' },
    },
  },
  chart: [
    { date: '2026-02-23', completedTrainings: 1, completedWorkouts: 1, completedRuns: 0, runDistanceKm: 0, durationMin: 55, waterMl: 2100, waterGoalMl: 2500, caloriesEstimated: 260, weightKg: 82.8 },
    { date: '2026-02-24', completedTrainings: 0, completedWorkouts: 0, completedRuns: 0, runDistanceKm: 0, durationMin: 0, waterMl: 1800, waterGoalMl: 2500, caloriesEstimated: 0, weightKg: null },
    { date: '2026-02-25', completedTrainings: 1, completedWorkouts: 1, completedRuns: 0, runDistanceKm: 0, durationMin: 52, waterMl: 2400, waterGoalMl: 2500, caloriesEstimated: 300, weightKg: 82.5 },
    { date: '2026-02-26', completedTrainings: 1, completedWorkouts: 0, completedRuns: 1, runDistanceKm: 5.2, durationMin: 34, waterMl: 1900, waterGoalMl: 2500, caloriesEstimated: 280, weightKg: null },
    { date: '2026-02-27', completedTrainings: 0, completedWorkouts: 0, completedRuns: 0, runDistanceKm: 0, durationMin: 0, waterMl: 2200, waterGoalMl: 2500, caloriesEstimated: 0, weightKg: null },
    { date: '2026-02-28', completedTrainings: 1, completedWorkouts: 1, completedRuns: 0, runDistanceKm: 0, durationMin: 58, waterMl: 2600, waterGoalMl: 2500, caloriesEstimated: 320, weightKg: 82.1 },
    { date: '2026-03-01', completedTrainings: 0, completedWorkouts: 0, completedRuns: 0, runDistanceKm: 0, durationMin: 0, waterMl: 2400, waterGoalMl: 2500, caloriesEstimated: 0, weightKg: null },
  ],
  strengthPrs: [
    { exerciseName: 'Supino reto', bestLoadVolumeKg: 960, achievedAt: '2026-02-28T08:00:00.000Z' },
    { exerciseName: 'Agachamento', bestLoadVolumeKg: 920, achievedAt: '2026-02-26T08:00:00.000Z' },
    { exerciseName: 'Remada', bestLoadVolumeKg: 780, achievedAt: '2026-02-23T08:00:00.000Z' },
  ],
  strengthWeeklyVolume: [
    { weekStart: '2026-02-17', volumeKg: 2120 },
    { weekStart: '2026-02-24', volumeKg: 2660 },
  ],
  weightTrend: {
    trend7dKg: -0.4,
    trend30dKg: -1.1,
  },
  measurementSummary: {
    lastUpdatedAt: '2026-02-28T08:05:00.000Z',
    lastUpdatedByLabel: 'Nutri FitQuest',
  },
  insights: ['Voce treinou +20% que semana passada.', 'Aderencia de agua caiu nesta semana.'],
  weightHistory: [
    { id: 'w-1', date: '2026-02-23', weightKg: 82.8 },
    { id: 'w-2', date: '2026-02-25', weightKg: 82.5 },
    { id: 'w-3', date: '2026-02-28', weightKg: 82.1 },
  ],
  weightLogs: [
    {
      id: 'wl-1',
      studentId: 'student-1',
      date: '2026-02-28',
      weightKg: 82.1,
      recordedByRole: 'STUDENT',
      recordedById: 'student-1',
      createdAt: '2026-02-28T08:00:00.000Z',
    },
  ],
  bodyMeasurementLogs: [
    {
      id: 'ml-1',
      studentId: 'student-1',
      date: '2026-02-28',
      measurements: {
        chestCm: 98,
        waistCm: 84,
        hipsCm: 97,
        armCm: 34,
        thighCm: 56,
      },
      recordedByRole: 'NUTRITIONIST',
      recordedById: 'nutritionist-1',
      createdAt: '2026-02-28T08:05:00.000Z',
    },
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
  cardioHistory: [
    {
      sessionId: 'run-1',
      title: 'Corrida',
      completedAt: '2026-03-01T06:30:00.000Z',
      durationSec: 2100,
      distanceKm: 5.2,
      calories: 320,
      paceSecPerKm: 404,
      starsEarned: 12,
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
    primaryGoal: 'Melhorar composicao corporal',
    headline: 'Rotina de treino e nutricao',
    supportTeam: [],
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
  todayWorkout: null,
  cardioSession: null,
  nutritionPlan: {
    date: '2026-03-11',
    status: 'in_progress',
    adherencePct: 80,
    caloriesTarget: 2100,
    caloriesConsumed: 1600,
    proteinTargetG: 160,
    proteinConsumedG: 125,
    carbsTargetG: 220,
    carbsConsumedG: 170,
    fatTargetG: 70,
    fatConsumedG: 55,
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
  achievements: [],
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
    currentWeightKg: 82.1,
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
        <ProgressPage />
      </QueryClientProvider>
    </FqToastProvider>,
  )
}

describe('ProgressPage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders weekly summary and history', async () => {
    vi.spyOn(progressService, 'getOverview').mockResolvedValue(overviewFixture)
    vi.spyOn(progressService, 'requestMeasurementsUpdate').mockResolvedValue({ sent: true })
    vi.spyOn(studentService, 'getDashboard').mockResolvedValue(dashboardFixture)

    renderPage()

    await screen.findByRole('heading', { name: 'Progresso' })

    expect(screen.getByText('Comparativos de evolucao')).toBeInTheDocument()
    expect(screen.getByText('Corpo e medidas')).toBeInTheDocument()
    expect(screen.getByText('Historico recente')).toBeInTheDocument()
  })

  it('renders error state when service fails', async () => {
    vi.spyOn(progressService, 'getOverview').mockRejectedValue(new Error('network error'))
    vi.spyOn(studentService, 'getDashboard').mockResolvedValue(dashboardFixture)

    renderPage()

    await screen.findByRole('alert')

    expect(screen.getByText('Falha ao carregar progresso')).toBeInTheDocument()
  })
})
