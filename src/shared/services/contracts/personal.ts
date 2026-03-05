import type { MeasurementsUpdateRequest } from '@/shared/services/contracts/requests'

export type PersonalStudent = {
  id: string
  name: string
  email: string
  workoutsPerWeekTarget: number
  activeWorkouts: number
}

export type PersonalAssignedWorkout = {
  id: string
  studentId: string
  studentName: string
  assignmentScope?: 'student' | 'personal'
  title: string
  description?: string
  date: string
  isActive: boolean
  frequencyWeekly: number
  exercisesCount: number
  muscleGroups?: string[]
  intensity?: PersonalWorkoutIntensity
  starsReward?: number
  estimatedDurationMin?: number
  weekdays?: PersonalWorkoutWeekday[]
  source?: 'manual' | 'assistant'
  exercises?: PersonalWorkoutExercise[]
  createdAt: string
}

export type PersonalStudentWorkoutHistoryItem = {
  sessionId: string
  title: string
  completedAt: string
  durationSec: number
  completedSets: number
  totalSets: number
}

export type PersonalStudentWorkoutHistory = {
  studentId: string
  studentName: string
  sessions: PersonalStudentWorkoutHistoryItem[]
}

export type PersonalMetrics = {
  linkedStudents: number
  workoutsAssignedThisWeek: number
  avgFrequencyWeekly: number
  completedWorkoutsThisWeek: number
  studentFrequency: PersonalStudentFrequency[]
  loadEvolution: PersonalStudentLoadEvolution[]
  alerts: PersonalAlert[]
}

export type PersonalStudentFrequency = {
  studentId: string
  studentName: string
  completedWorkoutsThisWeek: number
  targetWorkoutsPerWeek: number
  frequencyPct: number
}

export type PersonalLoadEvolutionPoint = {
  weekStart: string
  averageLoadVolumeKg: number
  sessions: number
}

export type PersonalLoadEvolutionTrend = 'up' | 'down' | 'stable'

export type PersonalStudentLoadEvolution = {
  studentId: string
  studentName: string
  currentWeekAverageLoadKg: number
  previousWeekAverageLoadKg: number
  deltaPct: number
  trend: PersonalLoadEvolutionTrend
  series: PersonalLoadEvolutionPoint[]
}

export type PersonalAlertType = 'missed-workout' | 'low-consistency'
export type PersonalAlertSeverity = 'warning' | 'danger'

export type PersonalAlert = {
  id: string
  studentId: string
  studentName: string
  type: PersonalAlertType
  severity: PersonalAlertSeverity
  message: string
}

export type PersonalDashboardOverview = {
  students: PersonalStudent[]
  workouts: PersonalAssignedWorkout[]
  metrics: PersonalMetrics
  measurementRequests: MeasurementsUpdateRequest[]
}

export type PersonalStudentInviteLink = {
  code: string
  inviteLink: string
}

export type PersonalWorkoutExerciseInput = {
  id?: string
  name: string
  sets: number
  reps: number
  restSec?: number
  suggestedLoadKg: number
  muscleGroup?: string
  equipment?: string
  durationMin?: number
}

export type PersonalWorkoutExercise = Required<
  Pick<PersonalWorkoutExerciseInput, 'name' | 'sets' | 'reps' | 'suggestedLoadKg'>
> &
  Omit<PersonalWorkoutExerciseInput, 'name' | 'sets' | 'reps' | 'suggestedLoadKg'> & {
    id: string
    order: number
  }

export type PersonalWorkoutIntensity = 'iniciante' | 'intermediario' | 'avancado'
export type PersonalWorkoutWeekday = 'Seg' | 'Ter' | 'Qua' | 'Qui' | 'Sex' | 'Sab' | 'Dom'

export type CreatePersonalWorkoutInput = {
  studentId?: string
  title: string
  description?: string
  date?: string
  frequencyWeekly: number
  muscleGroups?: string[]
  intensity?: PersonalWorkoutIntensity
  starsReward?: number
  estimatedDurationMin?: number
  weekdays?: PersonalWorkoutWeekday[]
  source?: 'manual' | 'assistant'
  exercises: PersonalWorkoutExerciseInput[]
}

export type UpdatePersonalWorkoutInput = {
  studentId: string
  workoutId: string
  title?: string
  description?: string
  date?: string
  frequencyWeekly?: number
  muscleGroups?: string[]
  intensity?: PersonalWorkoutIntensity
  starsReward?: number
  estimatedDurationMin?: number
  weekdays?: PersonalWorkoutWeekday[]
  source?: 'manual' | 'assistant'
  exercises?: PersonalWorkoutExerciseInput[]
}

export type DeactivatePersonalWorkoutInput = {
  studentId: string
  workoutId: string
}

export type SendPersonalMotivationInput = {
  studentId: string
  message: string
}

export type GrantPersonalAchievementInput = {
  studentId: string
  title: string
  description: string
}
