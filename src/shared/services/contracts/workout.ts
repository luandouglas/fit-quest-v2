type ValueOf<T> = T[keyof T]

export const trainingPlanDayStatuses = {
  completed: 'completed',
  pending: 'pending',
  late: 'late',
  rest: 'rest',
} as const

export type TrainingPlanDayStatus = ValueOf<typeof trainingPlanDayStatuses>

export const workoutPlanStatuses = {
  completed: 'completed',
  pending: 'pending',
  late: 'late',
} as const

export type WorkoutPlanStatus = ValueOf<typeof workoutPlanStatuses>

export const workoutExerciseStatuses = {
  done: 'done',
  current: 'current',
  upcoming: 'upcoming',
} as const

export type WorkoutExerciseExecutionStatus = ValueOf<typeof workoutExerciseStatuses>

export const workoutSessionStatuses = {
  active: 'active',
  paused: 'paused',
  completed: 'completed',
} as const

export type WorkoutSessionStatus = ValueOf<typeof workoutSessionStatuses>

export const workoutMediaTypes = {
  video: 'video',
  image: 'image',
  gif: 'gif',
} as const

export type WorkoutSupportMediaType = ValueOf<typeof workoutMediaTypes>

export type WorkoutIntensity = 'iniciante' | 'intermediario' | 'avancado'
export type WorkoutWeekday = 'Seg' | 'Ter' | 'Qua' | 'Qui' | 'Sex' | 'Sab' | 'Dom'
export type WorkoutSource = 'manual' | 'assistant'
export type WorkoutExerciseIconName = 'dumbbell' | 'flame' | 'target'

export type TrainingPlanDay = {
  date: string
  weekday: string
  isToday: boolean
  isCompleted: boolean
  hasWorkout: boolean
  status: TrainingPlanDayStatus
}

export type WorkoutSupportMedia = {
  id: string
  type: WorkoutSupportMediaType
  url: string
  thumbnailUrl?: string
  durationSec?: number
  label?: string
}

export type WorkoutExercise = {
  id: string
  name: string
  sets: number
  reps: number
  restSec: number
  note?: string
  status: WorkoutExerciseExecutionStatus
  order: number
  durationMin: number
  suggestedLoadKg?: number
  muscleGroup?: string
  equipment?: string
  supportMedia?: WorkoutSupportMedia | null
  iconName?: WorkoutExerciseIconName
}

export type WorkoutPlanItem = {
  id: string
  title: string
  description?: string
  date: string
  status: WorkoutPlanStatus
  isActive?: boolean
  estimatedDurationMin: number
  isQuickWorkout?: boolean
  frequencyWeekly?: number
  assignedByPersonalId?: string
  muscleGroups?: string[]
  intensity?: WorkoutIntensity
  starsReward?: number
  weekdays?: WorkoutWeekday[]
  source?: WorkoutSource
  createdAt?: string
  exerciseCount?: number
  personalNote?: string
}

export type TodayWorkout = {
  workoutId?: string
  title: string
  status?: WorkoutPlanStatus
  durationMin: number
  calories: number
  stars: number
  progressPct: number
  completedCount: number
  totalCount: number
  muscleGroups?: string[]
  estimatedStartLabel?: string
}

export type WorkoutPlanPermissions = {
  hasActivePersonal: boolean
  canCreateQuickWorkout: boolean
  canExecuteOnlyAssigned: boolean
  canEditPlan: boolean
}

export type WorkoutPlanSnapshot = {
  week: TrainingPlanDay[]
  workouts: WorkoutPlanItem[]
  exercises: WorkoutExercise[]
  todayWorkout: TodayWorkout
  permissions: WorkoutPlanPermissions
  history: WorkoutSessionHistoryEntry[]
}

export type CreateQuickWorkoutInput = {
  date?: string
  title?: string
}

export type WorkoutDetail = WorkoutPlanItem & {
  focusLabel: string
  personalNote?: string
  adherencePct: number
  completionCount: number
  scheduledWindowLabel?: string
  exercises: WorkoutExercise[]
  recentHistory: WorkoutSessionHistoryEntry[]
}

export type StartWorkoutSessionInput = {
  workoutId?: string
  date?: string
}

export type WorkoutSession = {
  sessionId: string
  studentId?: string
  startedAt: string
  pausedAt?: string
  completedAt?: string
  status: WorkoutSessionStatus
  workoutId?: string
  title: string
  exercises: WorkoutExercise[]
  setsDoneByExerciseId: Record<string, number>
  totalElapsedSec: number
  restTimerSec: number
  currentExerciseId?: string
  rewardStars: number
}

export type WorkoutSessionExerciseRecord = {
  exerciseId: string
  exerciseName: string
  loadVolumeKg: number
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
  exerciseRecords: WorkoutSessionExerciseRecord[]
  rewardStars: number
  streakDays: number
  currentLevel: number
  nextLevel: number
  currentLevelStars: number
  nextLevelStars: number
  starsToNextLevel: number
  weeklyCompletedWorkouts: number
  weeklyTargetWorkouts: number
  weeklyCompletionDelta: number
  completionMessage: string
}

export type WorkoutSessionHistoryEntry = WorkoutSessionSummary & {
  adherencePct: number
  muscleGroups: string[]
}

export type UpdateWorkoutExerciseStatusInput = {
  id: string
  status: WorkoutExercise['status']
}
