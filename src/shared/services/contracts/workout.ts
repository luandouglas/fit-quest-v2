import type { ExerciseItem, TodayWorkout, TrainingPlanDay } from '@/pages/training-plan/types'

export type WorkoutPlanSnapshot = {
  week: TrainingPlanDay[]
  exercises: ExerciseItem[]
  todayWorkout: TodayWorkout
}
