export type ProgressRange = '7d' | '30d' | '90d'

export type ProgressChartPoint = {
  date: string
  completedTrainings: number
  completedWorkouts: number
  completedRuns: number
  runDistanceKm: number
  durationMin: number
  waterMl: number
  waterGoalMl: number
  caloriesEstimated: number
  weightKg: number | null
}

export type WorkoutHistoryEntry = {
  sessionId: string
  title: string
  completedAt: string
  durationSec: number
  completedSets: number
  totalSets: number
}

export type ProgressWeeklySummary = {
  completedTrainings: number
  targetTrainings: number
  totalDurationMin: number
  averageCompletionPct: number
}

export type ProgressMetrics = {
  currentWeightKg: number
  weightDeltaKg: number
  workoutsPerWeek: number
  avgWaterMl: number
  estimatedCalories: number
}

export type ProgressMonthSummary = {
  completedWorkouts: number
  totalTrainingMin: number
  completedRuns: number
  totalRunKm: number
  hydrationAdherencePct: number
}

export type ProgressStrengthPr = {
  exerciseName: string
  bestLoadVolumeKg: number
  achievedAt: string
}

export type ProgressStrengthWeeklyVolume = {
  weekStart: string
  volumeKg: number
}

export type ProgressWeightTrend = {
  trend7dKg: number
  trend30dKg: number
}

export type ProgressMeasurementSummary = {
  lastUpdatedAt: string | null
  lastUpdatedByLabel: string
}

export type ProgressWeightEntry = {
  id: string
  date: string
  weightKg: number
}

export type BodyMeasurements = {
  chestCm: number
  waistCm: number
  hipsCm: number
  armCm: number
  thighCm: number
}

export type ProgressActorRole = 'STUDENT' | 'PERSONAL' | 'NUTRITIONIST'

export type ProgressWeightLog = {
  id: string
  studentId: string
  date: string
  weightKg: number
  recordedByRole: ProgressActorRole
  recordedById: string
  comment?: string
  createdAt: string
  revisedFromLogId?: string
}

export type BodyMeasurementLog = {
  id: string
  studentId: string
  date: string
  measurements: BodyMeasurements
  recordedByRole: ProgressActorRole
  recordedById: string
  comment?: string
  createdAt: string
  revisedFromLogId?: string
}

export type ProgressOverview = {
  range: ProgressRange
  monthSummary: ProgressMonthSummary
  weeklySummary: ProgressWeeklySummary
  metrics: ProgressMetrics
  strengthPrs: ProgressStrengthPr[]
  strengthWeeklyVolume: ProgressStrengthWeeklyVolume[]
  weightTrend: ProgressWeightTrend
  measurementSummary: ProgressMeasurementSummary
  insights: string[]
  chart: ProgressChartPoint[]
  weightHistory: ProgressWeightEntry[]
  weightLogs: ProgressWeightLog[]
  bodyMeasurementLogs: BodyMeasurementLog[]
  recentHistory: WorkoutHistoryEntry[]
}
