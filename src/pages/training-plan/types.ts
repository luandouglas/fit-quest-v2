export type TrainingPlanDay = {
  date: string
  weekday: string
  isToday: boolean
  isCompleted: boolean
  hasWorkout: boolean
}

export type TodayWorkout = {
  title: string
  durationMin: number
  calories: number
  stars: number
  progressPct: number
  completedCount: number
  totalCount: number
}

export type ExerciseStatus = 'done' | 'current' | 'upcoming'

export type ExerciseIconName = 'dumbbell' | 'flame' | 'target'

export type ExerciseItem = {
  id: string
  name: string
  sets: number
  reps: number
  durationMin: number
  status: ExerciseStatus
  order: number
  iconName?: ExerciseIconName
}

export type TrainingPlanUiState = 'loading' | 'ready' | 'empty' | 'error'
