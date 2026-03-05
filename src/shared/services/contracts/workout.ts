import type { ExerciseItem, TodayWorkout, TrainingPlanDay, WorkoutPlanItem } from '@/pages/training-plan/types'

export type WorkoutPlanPermissions = {
  hasActivePersonal: boolean
  canCreateQuickWorkout: boolean
  canExecuteOnlyAssigned: boolean
  canEditPlan: boolean
}

export type WorkoutPlanSnapshot = {
  week: TrainingPlanDay[]
  workouts: WorkoutPlanItem[]
  exercises: ExerciseItem[]
  todayWorkout: TodayWorkout
  permissions: WorkoutPlanPermissions
}

export type CreateQuickWorkoutInput = {
  date?: string
  title?: string
}

export type WorkoutSessionStatus = 'active' | 'paused' | 'completed'

export type WorkoutSession = {
  sessionId: string
  startedAt: string
  pausedAt?: string
  completedAt?: string
  status: WorkoutSessionStatus
  workoutId?: string
  title: string
  exercises: ExerciseItem[]
  setsDoneByExerciseId: Record<string, number>
  totalElapsedSec: number
  restTimerSec: number
}

export type StartWorkoutSessionInput = {
  workoutId?: string
}

export type WorkoutSessionSummary = {
  sessionId: string
  studentId?: string
  workoutId?: string
  title: string
  startedAt: string
  completedAt: string
  durationSec: number
  totalExercises: number
  completedExercises: number
  totalSets: number
  completedSets: number
  loadVolumeKg: number
  exerciseRecords: Array<{
    exerciseId: string
    exerciseName: string
    loadVolumeKg: number
  }>
}
