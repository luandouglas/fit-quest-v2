import { mockExercises } from '@/pages/training-plan/data/mockTrainingPlan'
import type { ExerciseItem, TodayWorkout, TrainingPlanDay, WorkoutPlanItem } from '@/pages/training-plan/types'
import {
  WORKOUT_EXERCISES_BY_STUDENT_STORAGE_KEY,
  WORKOUT_EXERCISES_STORAGE_KEY,
  WORKOUT_PLAN_BY_STUDENT_STORAGE_KEY,
  WORKOUT_PLAN_STORAGE_KEY,
} from '@/shared/constants'
import type { CreateQuickWorkoutInput } from '@/shared/services/contracts/workout'
import { workoutSessionMockRepository } from '@/shared/services/repositories/workoutSessionMockRepository'
import { storage } from '@/shared/services/storage'

const weekdayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'] as const

type StoredWorkoutPlanItem = {
  id: string
  title: string
  description?: string
  date: string
  isActive?: boolean
  estimatedDurationMin: number
  isQuickWorkout?: boolean
  frequencyWeekly?: number
  assignedByPersonalId?: string
  muscleGroups?: string[]
  intensity?: WorkoutPlanItem['intensity']
  starsReward?: number
  weekdays?: WorkoutPlanItem['weekdays']
  source?: WorkoutPlanItem['source']
  exercises?: StoredWorkoutExercise[]
  createdAt?: string
}

type StoredWorkoutExercise = {
  id: string
  name: string
  sets: number
  reps: number
  restSec: number
  suggestedLoadKg: number
  muscleGroup?: string
  equipment?: string
  durationMin: number
}

type StoredWorkoutPlanByStudent = Record<string, StoredWorkoutPlanItem[]>
type StoredExercisesByStudent = Record<string, ExerciseItem[]>

type CreateAssignedWorkoutInput = {
  studentId: string
  workoutId?: string
  title: string
  description?: string
  date: string
  frequencyWeekly: number
  assignedByPersonalId: string
  muscleGroups?: string[]
  intensity?: WorkoutPlanItem['intensity']
  starsReward?: number
  estimatedDurationMin?: number
  weekdays?: WorkoutPlanItem['weekdays']
  source?: WorkoutPlanItem['source']
  exercises: Array<{
    id?: string
    name: string
    sets: number
    reps: number
    restSec?: number
    suggestedLoadKg: number
    muscleGroup?: string
    equipment?: string
    durationMin?: number
  }>
}

function toIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate
}

function startOfWeek(date: Date) {
  const nextDate = new Date(date)
  const day = nextDate.getDay()
  const diff = (day + 6) % 7
  nextDate.setDate(nextDate.getDate() - diff)
  nextDate.setHours(0, 0, 0, 0)
  return nextDate
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function normalizeStoredWorkoutExercise(
  input: {
    id?: string
    name: string
    sets: number
    reps: number
    restSec?: number
    suggestedLoadKg: number
    muscleGroup?: string
    equipment?: string
    durationMin?: number
  },
  index: number,
): StoredWorkoutExercise {
  return {
    id: input.id ?? crypto.randomUUID(),
    name: input.name.trim() || `Exercicio ${index + 1}`,
    sets: Math.max(1, Math.round(input.sets)),
    reps: Math.max(1, Math.round(input.reps)),
    restSec: clamp(Math.round(input.restSec ?? 60), 20, 300),
    suggestedLoadKg: Math.max(0, Number((input.suggestedLoadKg ?? 0).toFixed(1))),
    muscleGroup: input.muscleGroup?.trim() ? input.muscleGroup.trim() : undefined,
    equipment: input.equipment?.trim() ? input.equipment.trim() : undefined,
    durationMin: clamp(Math.round(input.durationMin ?? 6), 2, 30),
  }
}

function toExerciseItem(exercise: StoredWorkoutExercise, index: number): ExerciseItem {
  return {
    id: exercise.id,
    name: exercise.name,
    sets: exercise.sets,
    reps: exercise.reps,
    suggestedLoadKg: exercise.suggestedLoadKg,
    durationMin: exercise.durationMin,
    status: (index === 0 ? 'current' : 'upcoming') as ExerciseItem['status'],
    order: index + 1,
    iconName: 'dumbbell',
  }
}

function createDefaultWeekPlan(): StoredWorkoutPlanItem[] {
  const now = new Date()
  const weekStart = startOfWeek(now)

  return [
    { id: crypto.randomUUID(), title: 'Upper Body Day', date: toIsoDate(addDays(weekStart, 0)), isActive: true, estimatedDurationMin: 44, frequencyWeekly: 4, createdAt: new Date().toISOString() },
    { id: crypto.randomUUID(), title: 'Lower Body Day', date: toIsoDate(addDays(weekStart, 1)), isActive: true, estimatedDurationMin: 48, frequencyWeekly: 4, createdAt: new Date().toISOString() },
    { id: crypto.randomUUID(), title: 'Core and Mobility', date: toIsoDate(addDays(weekStart, 2)), isActive: true, estimatedDurationMin: 35, frequencyWeekly: 4, createdAt: new Date().toISOString() },
    { id: crypto.randomUUID(), title: 'Push Strength', date: toIsoDate(addDays(weekStart, 3)), isActive: true, estimatedDurationMin: 46, frequencyWeekly: 4, createdAt: new Date().toISOString() },
    { id: crypto.randomUUID(), title: 'Cardio and Recovery', date: toIsoDate(addDays(weekStart, 4)), isActive: true, estimatedDurationMin: 32, frequencyWeekly: 4, createdAt: new Date().toISOString() },
  ]
}

function createDefaultExercises(): ExerciseItem[] {
  return mockExercises.map((exercise, index) => ({
    ...exercise,
    status: (index === 0 ? 'current' : 'upcoming') as ExerciseItem['status'],
  }))
}

function migrateLegacyPlanIfNeeded(map: StoredWorkoutPlanByStudent) {
  if (Object.keys(map).length > 0) {
    return map
  }

  const legacy = storage.get<StoredWorkoutPlanItem[]>(WORKOUT_PLAN_STORAGE_KEY)

  if (!legacy || legacy.length === 0) {
    return map
  }

  return {
    ...map,
    'current-user': legacy,
  }
}

function migrateLegacyExercisesIfNeeded(map: StoredExercisesByStudent) {
  if (Object.keys(map).length > 0) {
    return map
  }

  const legacy = storage.get<ExerciseItem[]>(WORKOUT_EXERCISES_STORAGE_KEY)

  if (!legacy || legacy.length === 0) {
    return map
  }

  return {
    ...map,
    'current-user': legacy,
  }
}

function getPlanMap(): StoredWorkoutPlanByStudent {
  const stored = storage.get<StoredWorkoutPlanByStudent>(WORKOUT_PLAN_BY_STUDENT_STORAGE_KEY) ?? {}
  const migrated = migrateLegacyPlanIfNeeded(stored)

  if (migrated !== stored) {
    storage.set(WORKOUT_PLAN_BY_STUDENT_STORAGE_KEY, migrated)
  }

  return migrated
}

function savePlanMap(map: StoredWorkoutPlanByStudent) {
  storage.set(WORKOUT_PLAN_BY_STUDENT_STORAGE_KEY, map)
}

function getExercisesMap(): StoredExercisesByStudent {
  const stored = storage.get<StoredExercisesByStudent>(WORKOUT_EXERCISES_BY_STUDENT_STORAGE_KEY) ?? {}
  const migrated = migrateLegacyExercisesIfNeeded(stored)

  if (migrated !== stored) {
    storage.set(WORKOUT_EXERCISES_BY_STUDENT_STORAGE_KEY, migrated)
  }

  return migrated
}

function saveExercisesMap(map: StoredExercisesByStudent) {
  storage.set(WORKOUT_EXERCISES_BY_STUDENT_STORAGE_KEY, map)
}

function getStoredPlan(studentId: string): StoredWorkoutPlanItem[] {
  const planMap = getPlanMap()
  const existing = planMap[studentId]

  if (existing && existing.length > 0) {
    return existing
  }

  const seeded = createDefaultWeekPlan()
  const nextMap = {
    ...planMap,
    [studentId]: seeded,
  }
  savePlanMap(nextMap)

  return seeded
}

function saveStoredPlan(studentId: string, plan: StoredWorkoutPlanItem[]) {
  const planMap = getPlanMap()
  savePlanMap({
    ...planMap,
    [studentId]: plan,
  })
}

function getStoredExercises(studentId: string): ExerciseItem[] {
  const exercisesMap = getExercisesMap()
  const existing = exercisesMap[studentId]

  if (existing && existing.length > 0) {
    return existing
  }

  const seeded = createDefaultExercises()
  const nextMap = {
    ...exercisesMap,
    [studentId]: seeded,
  }
  saveExercisesMap(nextMap)

  return seeded
}

function saveStoredExercises(studentId: string, exercises: ExerciseItem[]) {
  const exercisesMap = getExercisesMap()
  saveExercisesMap({
    ...exercisesMap,
    [studentId]: exercises,
  })
}

function getCompletedDates(studentId: string) {
  const history = workoutSessionMockRepository.getHistory()
  return new Set(
    history
      .filter((entry) => !entry.studentId || entry.studentId === studentId)
      .map((entry) => toIsoDate(new Date(entry.completedAt))),
  )
}

function toWorkoutStatus(date: string, isCompleted: boolean): WorkoutPlanItem['status'] {
  if (isCompleted) {
    return 'completed'
  }

  const today = toIsoDate(new Date())

  if (date < today) {
    return 'late'
  }

  return 'pending'
}

function toWeekDays(workouts: WorkoutPlanItem[]): TrainingPlanDay[] {
  const weekStart = startOfWeek(new Date())
  const workoutByDate = new Map(workouts.map((workout) => [workout.date, workout]))
  const today = toIsoDate(new Date())

  return Array.from({ length: 7 }, (_, offset) => {
    const date = toIsoDate(addDays(weekStart, offset))
    const workout = workoutByDate.get(date)
    const hasWorkout = Boolean(workout)
    const status: TrainingPlanDay['status'] = hasWorkout
      ? workout?.status ?? 'pending'
      : 'rest'

    return {
      date,
      weekday: weekdayLabels[new Date(`${date}T12:00:00`).getDay()],
      isToday: date === today,
      hasWorkout,
      isCompleted: status === 'completed',
      status,
    }
  })
}

function toWorkoutItems(studentId: string, includeInactive = false): WorkoutPlanItem[] {
  const completedDates = getCompletedDates(studentId)

  return getStoredPlan(studentId)
    .filter((workout) => includeInactive || workout.isActive !== false)
    .map((workout) => {
      const isCompleted = completedDates.has(workout.date)
      const status = toWorkoutStatus(workout.date, isCompleted)

      return {
        id: workout.id,
        title: workout.title,
        description: workout.description,
        date: workout.date,
        status,
        isActive: workout.isActive !== false,
        estimatedDurationMin: workout.estimatedDurationMin,
        isQuickWorkout: workout.isQuickWorkout,
        frequencyWeekly: workout.frequencyWeekly,
        assignedByPersonalId: workout.assignedByPersonalId,
        muscleGroups: workout.muscleGroups,
        intensity: workout.intensity,
        starsReward: workout.starsReward,
        weekdays: workout.weekdays,
        source: workout.source,
        createdAt: workout.createdAt,
      }
    })
    .sort((left, right) => left.date.localeCompare(right.date))
}

function getTodayWorkoutFromItems(
  workouts: WorkoutPlanItem[],
  progressPct: number,
  doneCount: number,
  totalCount: number,
): TodayWorkout {
  const today = toIsoDate(new Date())
  const todayWorkout = workouts.find((item) => item.date === today)

  if (todayWorkout) {
    return {
      workoutId: todayWorkout.id,
      title: todayWorkout.title,
      durationMin: todayWorkout.estimatedDurationMin,
      calories: Math.max(todayWorkout.estimatedDurationMin * 6, 120),
      stars: todayWorkout.starsReward ?? 25,
      progressPct,
      completedCount: doneCount,
      totalCount,
    }
  }

  const nextWorkout = workouts.find((item) => item.status !== 'completed')

  if (nextWorkout) {
    return {
      workoutId: nextWorkout.id,
      title: nextWorkout.title,
      durationMin: nextWorkout.estimatedDurationMin,
      calories: Math.max(nextWorkout.estimatedDurationMin * 6, 120),
      stars: nextWorkout.starsReward ?? 25,
      progressPct,
      completedCount: doneCount,
      totalCount,
    }
  }

  return {
    title: 'Nenhum treino planejado',
    durationMin: 0,
    calories: 0,
    stars: 0,
    progressPct,
    completedCount: doneCount,
    totalCount,
  }
}

type GetWorkoutOptions = {
  includeInactive?: boolean
  assignedByPersonalId?: string | null
}

function filterWorkoutItems(workouts: WorkoutPlanItem[], options?: GetWorkoutOptions) {
  if (!options?.assignedByPersonalId) {
    return workouts
  }

  return workouts.filter((workout) => workout.assignedByPersonalId === options.assignedByPersonalId)
}

export const workoutMockRepository = {
  getWeek(studentId = 'current-user', options?: GetWorkoutOptions): TrainingPlanDay[] {
    const workouts = filterWorkoutItems(
      toWorkoutItems(studentId, options?.includeInactive ?? false),
      options,
    )
    return toWeekDays(workouts)
  },
  getWorkouts(studentId = 'current-user', options?: GetWorkoutOptions): WorkoutPlanItem[] {
    return filterWorkoutItems(
      toWorkoutItems(studentId, options?.includeInactive ?? false),
      options,
    )
  },
  getWorkoutById(workoutId: string, studentId = 'current-user'): WorkoutPlanItem | null {
    const match = toWorkoutItems(studentId, true).find((workout) => workout.id === workoutId)
    return match ?? null
  },
  hasAssignedWorkout(studentId: string, personalId?: string) {
    return toWorkoutItems(studentId, true).some((workout) => {
      if (workout.isActive === false || !workout.assignedByPersonalId) {
        return false
      }

      if (!personalId) {
        return true
      }

      return workout.assignedByPersonalId === personalId
    })
  },
  createQuickWorkout(input?: CreateQuickWorkoutInput, studentId = 'current-user'): WorkoutPlanItem {
    const date = input?.date ?? toIsoDate(new Date())
    const title = input?.title?.trim() || 'Treino rapido'
    const plan = getStoredPlan(studentId)

    const existing = plan.find((item) => item.date === date && item.isQuickWorkout)

    if (existing) {
      const isCompleted = getCompletedDates(studentId).has(existing.date)
      return {
        id: existing.id,
        title: existing.title,
        description: existing.description,
        date: existing.date,
        status: toWorkoutStatus(existing.date, isCompleted),
        isActive: existing.isActive !== false,
        estimatedDurationMin: existing.estimatedDurationMin,
        isQuickWorkout: true,
        frequencyWeekly: existing.frequencyWeekly,
        assignedByPersonalId: existing.assignedByPersonalId,
        muscleGroups: existing.muscleGroups,
        intensity: existing.intensity,
        starsReward: existing.starsReward,
        weekdays: existing.weekdays,
        source: existing.source,
        createdAt: existing.createdAt,
      }
    }

    const nextItem: StoredWorkoutPlanItem = {
      id: crypto.randomUUID(),
      title,
      date,
      isActive: true,
      estimatedDurationMin: 20,
      isQuickWorkout: true,
      frequencyWeekly: 3,
      createdAt: new Date().toISOString(),
    }

    saveStoredPlan(studentId, [nextItem, ...plan])

    return {
      id: nextItem.id,
      title: nextItem.title,
      description: nextItem.description,
      date: nextItem.date,
      status: toWorkoutStatus(nextItem.date, getCompletedDates(studentId).has(nextItem.date)),
      isActive: nextItem.isActive,
      estimatedDurationMin: nextItem.estimatedDurationMin,
      isQuickWorkout: true,
      frequencyWeekly: nextItem.frequencyWeekly,
      assignedByPersonalId: nextItem.assignedByPersonalId,
      muscleGroups: nextItem.muscleGroups,
      intensity: nextItem.intensity,
      starsReward: nextItem.starsReward,
      weekdays: nextItem.weekdays,
      source: nextItem.source,
      createdAt: nextItem.createdAt,
    }
  },
  createWorkoutForStudent(input: CreateAssignedWorkoutInput): WorkoutPlanItem {
    const title = input.title.trim() || 'Treino personalizado'
    const normalizedExercises = input.exercises.map((exercise, index) =>
      normalizeStoredWorkoutExercise(exercise, index),
    )
    const exercises = normalizedExercises.map((exercise, index) => toExerciseItem(exercise, index))

    const estimatedDurationMin = Math.max(
      normalizedExercises.reduce((total, exercise) => total + exercise.durationMin, 0),
      18,
    )

    const nextItem: StoredWorkoutPlanItem = {
      id: input.workoutId ?? crypto.randomUUID(),
      title,
      description: input.description?.trim() ? input.description.trim() : undefined,
      date: input.date,
      isActive: true,
      estimatedDurationMin: Math.max(10, Math.round(input.estimatedDurationMin ?? estimatedDurationMin)),
      frequencyWeekly: Math.max(1, Math.round(input.frequencyWeekly)),
      assignedByPersonalId: input.assignedByPersonalId,
      muscleGroups: input.muscleGroups?.length ? input.muscleGroups : undefined,
      intensity: input.intensity,
      starsReward:
        typeof input.starsReward === 'number'
          ? clamp(Math.round(input.starsReward), 50, 200)
          : undefined,
      weekdays: input.weekdays?.length ? input.weekdays : undefined,
      source: input.source ?? 'manual',
      exercises: normalizedExercises,
      createdAt: new Date().toISOString(),
    }

    const plan = getStoredPlan(input.studentId)
    saveStoredPlan(input.studentId, [nextItem, ...plan])
    saveStoredExercises(input.studentId, exercises)

    return {
      id: nextItem.id,
      title: nextItem.title,
      description: nextItem.description,
      date: nextItem.date,
      status: toWorkoutStatus(nextItem.date, false),
      isActive: nextItem.isActive,
      estimatedDurationMin: nextItem.estimatedDurationMin,
      frequencyWeekly: nextItem.frequencyWeekly,
      assignedByPersonalId: nextItem.assignedByPersonalId,
      muscleGroups: nextItem.muscleGroups,
      intensity: nextItem.intensity,
      starsReward: nextItem.starsReward,
      weekdays: nextItem.weekdays,
      source: nextItem.source,
      createdAt: nextItem.createdAt,
    }
  },
  updateAssignedWorkout(input: {
    studentId: string
    workoutId: string
    title?: string
    description?: string
    date?: string
    frequencyWeekly?: number
    muscleGroups?: string[]
    intensity?: WorkoutPlanItem['intensity']
    starsReward?: number
    estimatedDurationMin?: number
    weekdays?: WorkoutPlanItem['weekdays']
    source?: WorkoutPlanItem['source']
    exercises?: Array<{
      id?: string
      name: string
      sets: number
      reps: number
      restSec?: number
      suggestedLoadKg: number
      muscleGroup?: string
      equipment?: string
      durationMin?: number
    }>
  }): WorkoutPlanItem | null {
    const plan = getStoredPlan(input.studentId)
    const target = plan.find((item) => item.id === input.workoutId)

    if (!target) {
      return null
    }

    const nextPlan = plan.map((item) => {
      if (item.id !== input.workoutId) {
        return item
      }

      const nextExercises =
        input.exercises !== undefined
          ? input.exercises.map((exercise, index) => normalizeStoredWorkoutExercise(exercise, index))
          : item.exercises

      const derivedEstimatedDuration =
        typeof input.estimatedDurationMin === 'number'
          ? Math.max(10, Math.round(input.estimatedDurationMin))
          : nextExercises?.length
            ? Math.max(10, nextExercises.reduce((total, exercise) => total + exercise.durationMin, 0))
            : item.estimatedDurationMin

      return {
        ...item,
        title: input.title?.trim() ? input.title.trim() : item.title,
        description:
          input.description !== undefined
            ? input.description.trim() || undefined
            : item.description,
        date: input.date ?? item.date,
        frequencyWeekly:
          typeof input.frequencyWeekly === 'number'
            ? Math.max(1, Math.round(input.frequencyWeekly))
            : item.frequencyWeekly,
        muscleGroups:
          input.muscleGroups !== undefined
            ? input.muscleGroups.length > 0
              ? input.muscleGroups
              : undefined
            : item.muscleGroups,
        intensity: input.intensity ?? item.intensity,
        starsReward:
          typeof input.starsReward === 'number'
            ? clamp(Math.round(input.starsReward), 50, 200)
            : item.starsReward,
        estimatedDurationMin: derivedEstimatedDuration,
        weekdays:
          input.weekdays !== undefined
            ? input.weekdays.length > 0
              ? input.weekdays
              : undefined
            : item.weekdays,
        source: input.source ?? item.source,
        exercises: nextExercises,
      }
    })

    saveStoredPlan(input.studentId, nextPlan)

    if (input.exercises !== undefined) {
      const nextExercises = input.exercises.map((exercise, index) => normalizeStoredWorkoutExercise(exercise, index))
      saveStoredExercises(
        input.studentId,
        nextExercises.map((exercise, index) => toExerciseItem(exercise, index)),
      )
    }

    return this.getWorkoutById(input.workoutId, input.studentId)
  },
  deactivateWorkout(input: { studentId: string; workoutId: string }): WorkoutPlanItem | null {
    const plan = getStoredPlan(input.studentId)
    const hasTarget = plan.some((item) => item.id === input.workoutId)

    if (!hasTarget) {
      return null
    }

    const nextPlan = plan.map((item) =>
      item.id === input.workoutId
        ? {
            ...item,
            isActive: false,
          }
        : item,
    )
    saveStoredPlan(input.studentId, nextPlan)

    return this.getWorkoutById(input.workoutId, input.studentId)
  },
  getExercises(studentId = 'current-user', workoutId?: string): ExerciseItem[] {
    if (workoutId) {
      const workout = getStoredPlan(studentId).find((item) => item.id === workoutId)
      if (workout?.exercises?.length) {
        return workout.exercises.map((exercise, index) => toExerciseItem(exercise, index))
      }
    }

    return getStoredExercises(studentId).map((exercise) => ({ ...exercise }))
  },
  getWorkoutExerciseDetails(studentId = 'current-user', workoutId: string): Array<{
    id: string
    name: string
    sets: number
    reps: number
    restSec: number
    suggestedLoadKg: number
    muscleGroup?: string
    equipment?: string
    durationMin: number
  }> {
    const workout = getStoredPlan(studentId).find((item) => item.id === workoutId)

    if (workout?.exercises?.length) {
      return workout.exercises.map((exercise) => ({ ...exercise }))
    }

    return getStoredExercises(studentId).map((exercise) => ({
      id: exercise.id,
      name: exercise.name,
      sets: Math.max(1, Math.round(exercise.sets)),
      reps: Math.max(1, Math.round(exercise.reps)),
      restSec: 60,
      suggestedLoadKg: Math.max(0, Number((exercise.suggestedLoadKg ?? 0).toFixed(1))),
      durationMin: Math.max(2, Math.round(exercise.durationMin || 6)),
    }))
  },
  updateExerciseStatus(id: string, status: ExerciseItem['status'], studentId = 'current-user') {
    const exercises = getStoredExercises(studentId)
    const nextExercises = exercises.map((exercise) =>
      exercise.id === id ? { ...exercise, status } : exercise,
    )

    if (status === 'current') {
      for (let index = 0; index < nextExercises.length; index += 1) {
        const exercise = nextExercises[index]

        if (exercise.id !== id && exercise.status === 'current') {
          nextExercises[index] = { ...exercise, status: 'upcoming' }
        }
      }
    }

    saveStoredExercises(studentId, nextExercises)
  },
  resetExercisesProgress(studentId = 'current-user') {
    saveStoredExercises(studentId, createDefaultExercises())
  },
  getTodayWorkout(progressPct: number, doneCount: number, totalCount: number, studentId = 'current-user'): TodayWorkout {
    const workouts = toWorkoutItems(studentId)
    return getTodayWorkoutFromItems(workouts, progressPct, doneCount, totalCount)
  },
}
