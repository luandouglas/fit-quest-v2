export type ProgressChartPoint = {
  date: string
  completedTrainings: number
  durationMin: number
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

export type ProgressOverview = {
  weeklySummary: ProgressWeeklySummary
  chart: ProgressChartPoint[]
  recentHistory: WorkoutHistoryEntry[]
}
