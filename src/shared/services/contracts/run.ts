export type RunSessionStatus = 'active' | 'completed'

export type RunSession = {
  sessionId: string
  startedAt: string
  endedAt?: string
  status: RunSessionStatus
  elapsedSec: number
  distanceKm: number
  calories: number
  paceSecPerKm: number
}

export type RunMetrics = {
  totalKmMonth: number
  bestPaceSecPerKm: number | null
  totalCalories: number
}

export type RunOverview = {
  activeSession: RunSession | null
  history: RunSession[]
  metrics: RunMetrics
}

export type RunRankingSnapshot = {
  points: number
  position: number
  totalAthletes: number
}
