export type TrainingPlanDay = {
  date: string
  weekday: string
  isToday: boolean
  isCompleted: boolean
  hasWorkout: boolean
  status: 'completed' | 'pending' | 'late' | 'rest'
}

export type WorkoutPlanItem = {
  id: string
  title: string
  description?: string
  date: string
  status: 'completed' | 'pending' | 'late'
  isActive?: boolean
  estimatedDurationMin: number
  isQuickWorkout?: boolean
  frequencyWeekly?: number
  assignedByPersonalId?: string
  muscleGroups?: string[]
  intensity?: 'iniciante' | 'intermediario' | 'avancado'
  starsReward?: number
  weekdays?: Array<'Seg' | 'Ter' | 'Qua' | 'Qui' | 'Sex' | 'Sab' | 'Dom'>
  source?: 'manual' | 'assistant'
  createdAt?: string
}

export type TodayWorkout = {
  workoutId?: string
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
  suggestedLoadKg?: number
  durationMin: number
  status: ExerciseStatus
  order: number
  iconName?: ExerciseIconName
}

export type TrainingPlanUiState = 'loading' | 'ready' | 'empty' | 'error'
