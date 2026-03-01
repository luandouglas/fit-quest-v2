import type { ExerciseItem, TodayWorkout, TrainingPlanDay } from '@/pages/training-plan/types'

export type WorkoutPlanSnapshot = {
  week: TrainingPlanDay[]
  exercises: ExerciseItem[]
  todayWorkout: TodayWorkout
}

export type WorkoutSessionStatus = 'active' | 'paused' | 'completed'

export type WorkoutSession = {
  sessionId: string
  startedAt: string
  pausedAt?: string
  completedAt?: string
  status: WorkoutSessionStatus
  title: string
  exercises: ExerciseItem[]
  setsDoneByExerciseId: Record<string, number>
  totalElapsedSec: number
  restTimerSec: number
}

export type WorkoutSessionSummary = {
  sessionId: string
  title: string
  startedAt: string
  completedAt: string
  durationSec: number
  totalExercises: number
  completedExercises: number
  totalSets: number
  completedSets: number
}
