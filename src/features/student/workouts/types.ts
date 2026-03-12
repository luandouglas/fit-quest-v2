import type {
  TodayWorkout,
  TrainingPlanDay,
  TrainingPlanDayStatus,
  WorkoutDetail,
  WorkoutExercise,
  WorkoutExerciseExecutionStatus,
  WorkoutExerciseIconName,
  WorkoutSessionHistoryEntry,
  WorkoutPlanItem,
} from '@/shared/services/contracts/workout'

export type {
  TodayWorkout,
  TrainingPlanDay,
  TrainingPlanDayStatus,
  WorkoutDetail,
  WorkoutExercise,
  WorkoutPlanItem,
}

export type ExerciseItem = WorkoutExercise
export type ExerciseStatus = WorkoutExerciseExecutionStatus
export type ExerciseIconName = WorkoutExerciseIconName
export type WorkoutHistoryEntry = WorkoutSessionHistoryEntry

export type TrainingPlanUiState = 'loading' | 'ready' | 'empty' | 'error'
