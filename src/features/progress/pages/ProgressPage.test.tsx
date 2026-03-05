import { render, screen } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'

import { createAppQueryClient } from '@/app/providers'
import { progressService, type ProgressOverview } from '@/shared/services'
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
  },
  weeklySummary: {
    completedTrainings: 3,
    targetTrainings: 5,
    totalDurationMin: 165,
    averageCompletionPct: 86,
  },
  metrics: {
    currentWeightKg: 82.1,
    weightDeltaKg: -0.4,
    workoutsPerWeek: 3,
    avgWaterMl: 2200,
    estimatedCalories: 1840,
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

    renderPage()

    await screen.findByRole('heading', { name: 'Progresso' })

    expect(screen.getByText('Resumo do mes')).toBeInTheDocument()
    expect(screen.getByText('Evolucao de forca')).toBeInTheDocument()
    expect(screen.getByText('Medidas corporais')).toBeInTheDocument()
  })

  it('renders error state when service fails', async () => {
    vi.spyOn(progressService, 'getOverview').mockRejectedValue(new Error('network error'))

    renderPage()

    await screen.findByRole('alert')

    expect(screen.getByText('Falha ao carregar progresso')).toBeInTheDocument()
  })
})
