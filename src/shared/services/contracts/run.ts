type ValueOf<T> = T[keyof T]

export const runSessionStatuses = {
  active: 'active',
  paused: 'paused',
  completed: 'completed',
} as const

export type RunSessionStatus = ValueOf<typeof runSessionStatuses>

export const runActivityTypes = {
  run: 'run',
  walk: 'walk',
} as const

export type RunActivityType = ValueOf<typeof runActivityTypes>

export const runTrackingSources = {
  manual: 'manual',
  gps: 'gps',
} as const

export type RunTrackingSource = ValueOf<typeof runTrackingSources>

export type StartRunInput = {
  activityType?: RunActivityType
}

export type RunSession = {
  sessionId: string
  studentId?: string
  activityType: RunActivityType
  startedAt: string
  endedAt?: string
  status: RunSessionStatus
  elapsedSec: number
  distanceKm: number
  calories: number
  paceSecPerKm: number
  starsEarned: number
  progressImpactPct: number
  source: RunTrackingSource
}

export type RunMetrics = {
  totalKmMonth: number
  bestPaceSecPerKm: number | null
  totalCalories: number
  totalSessionsMonth: number
  weeklyDistanceKm: number
  weeklyStars: number
}

export type RunOverview = {
  activeSession: RunSession | null
  history: RunSession[]
  metrics: RunMetrics
  recommendedGoalKm: number
  todayDistanceKm: number
  todayStars: number
  streakDays: number
}

export type RunRankingSnapshot = {
  points: number
  position: number
  totalAthletes: number
}
