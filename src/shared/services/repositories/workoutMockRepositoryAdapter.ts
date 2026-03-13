import { authService } from '@/shared/services/authService'
import type {
  CreateQuickWorkoutInput,
  StartWorkoutSessionInput,
  TodayWorkout,
  UpdateWorkoutExerciseStatusInput,
  WorkoutDetail,
  WorkoutExercise,
  WorkoutPlanItem,
  WorkoutPlanSnapshot,
  WorkoutSessionHistoryEntry,
  WorkoutSession,
  WorkoutSessionSummary,
} from '@/shared/services/contracts/workout'
import { deriveWorkoutMuscleGroups } from '@/shared/utils/exerciseFocus'

import type { WorkoutRepository } from './workoutRepository'
import { workoutMockRepository } from './workoutMockRepository'
import { workoutSessionMockRepository } from './workoutSessionMockRepository'

function resolveStudentId() {
  const session = authService.getStoredSession()
  return session?.user.id ?? 'current-user'
}

function toIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function startOfWeek(date: Date) {
  const nextDate = new Date(date)
  const day = nextDate.getDay()
  const diff = (day + 6) % 7
  nextDate.setDate(nextDate.getDate() - diff)
  nextDate.setHours(0, 0, 0, 0)
  return nextDate
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate
}

function isSameStudent(entry: { studentId?: string } | null, studentId: string) {
  return Boolean(entry && (!entry.studentId || entry.studentId === studentId))
}

function buildPermissions(workouts: WorkoutPlanItem[]) {
  const hasAssignedByProfessional = workouts.some((workout) => Boolean(workout.assignedByPersonalId))

  return {
    hasActivePersonal: hasAssignedByProfessional,
    canCreateQuickWorkout: !hasAssignedByProfessional,
    canExecuteOnlyAssigned: hasAssignedByProfessional,
    canEditPlan: false,
  }
}

function getPlanWindowLabel(date: string) {
  const todayKey = toIsoDate(new Date())

  if (date === todayKey) {
    return 'Prioridade do dia'
  }

  if (date < todayKey) {
    return 'Treino ainda pendente'
  }

  return 'Programado para a agenda da semana'
}

function getDefaultPersonalNote(workout: WorkoutPlanItem) {
  const groups = workout.muscleGroups?.join(', ')

  if (groups) {
    return `Capriche na técnica de ${groups.toLowerCase()} e respeite os descansos prescritos.`
  }

  return 'Mantenha ritmo constante, execução limpa e finalize todas as séries prescritas.'
}

function decorateExercise(exercise: WorkoutExercise): WorkoutExercise {
  return {
    ...exercise,
    note: exercise.note ?? 'Controle a execução e registre percepção de esforço ao concluir.',
  }
}

function getWorkoutExercises(studentId: string, workoutId?: string) {
  return workoutMockRepository
    .getExercises(studentId, workoutId)
    .map((exercise) => decorateExercise(exercise))
}

function getWorkoutHistoryEntries(studentId: string): WorkoutSessionSummary[] {
  return workoutSessionMockRepository
    .getHistory()
    .filter((entry) => !entry.studentId || entry.studentId === studentId)
}

function toHistoryEntries(history: WorkoutSessionSummary[], workouts: WorkoutPlanItem[]): WorkoutSessionHistoryEntry[] {
  const workoutById = new Map(workouts.map((workout) => [workout.id, workout]))

  return history.map((entry) => {
    const workout = entry.workoutId ? workoutById.get(entry.workoutId) : null

    return {
      ...entry,
      adherencePct: entry.totalSets > 0 ? Math.round((entry.completedSets / entry.totalSets) * 100) : 0,
      muscleGroups: workout?.muscleGroups ?? [],
    }
  })
}

function buildTodayWorkout(studentId: string, workouts: WorkoutPlanItem[], activeSession: WorkoutSession | null): TodayWorkout {
  if (activeSession) {
    const totalExercises = activeSession.exercises.length
    const completedExercises = activeSession.exercises.filter((exercise) => {
      const doneSets = activeSession.setsDoneByExerciseId[exercise.id] ?? 0
      return doneSets >= exercise.sets
    }).length

    return {
      workoutId: activeSession.workoutId,
      title: activeSession.title,
      durationMin: Math.max(Math.round(activeSession.exercises.reduce((total, exercise) => total + exercise.durationMin, 0)), 1),
      calories: Math.max(activeSession.exercises.length * 45, 140),
      stars: activeSession.rewardStars,
      progressPct: totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0,
      completedCount: completedExercises,
      totalCount: totalExercises,
      muscleGroups: activeSession.exercises
        .map((exercise) => exercise.muscleGroup)
        .filter((value): value is string => Boolean(value)),
      estimatedStartLabel: 'Sessão ativa agora',
    }
  }

  const todayKey = toIsoDate(new Date())
  const prioritizedWorkout =
    workouts.find((workout) => workout.date === todayKey) ??
    workouts.find((workout) => workout.status !== 'completed') ??
    workouts[0]

  if (!prioritizedWorkout) {
    return {
      title: 'Nenhum treino planejado',
      durationMin: 0,
      calories: 0,
      stars: 0,
      progressPct: 0,
      completedCount: 0,
      totalCount: 0,
    }
  }

  const exercises = getWorkoutExercises(studentId, prioritizedWorkout.id)
  const completedCount = exercises.filter((exercise) => exercise.status === 'done').length

  return {
    workoutId: prioritizedWorkout.id,
    title: prioritizedWorkout.title,
    durationMin: prioritizedWorkout.estimatedDurationMin,
    calories: Math.max(prioritizedWorkout.estimatedDurationMin * 6, 120),
    stars: prioritizedWorkout.starsReward ?? 25,
    progressPct: exercises.length ? Math.round((completedCount / exercises.length) * 100) : 0,
    completedCount,
    totalCount: exercises.length,
    muscleGroups: prioritizedWorkout.muscleGroups,
    estimatedStartLabel: getPlanWindowLabel(prioritizedWorkout.date),
  }
}

function getWeeklyProgress(history: WorkoutSessionSummary[]) {
  const weekStart = startOfWeek(new Date())
  const weekEnd = addDays(weekStart, 6).getTime()

  return history.filter((entry) => {
    const completedAt = new Date(entry.completedAt).getTime()
    return completedAt >= weekStart.getTime() && completedAt <= weekEnd
  })
}

function buildCompletionMessage(summary: {
  completedSets: number
  totalSets: number
  rewardStars: number
  weeklyCompletedWorkouts: number
  weeklyTargetWorkouts: number
}) {
  if (summary.completedSets >= summary.totalSets && summary.weeklyCompletedWorkouts >= summary.weeklyTargetWorkouts) {
    return 'Sessão fechada com 100% de execução. Semana no ritmo certo.'
  }

  if (summary.completedSets >= summary.totalSets) {
    return `Treino completo. +${summary.rewardStars} estrelas empurram você para o próximo nível.`
  }

  return 'Boa sessão. Continue registrando para elevar sua aderência semanal.'
}

function buildSessionSummary(session: WorkoutSession, studentId: string): WorkoutSessionSummary {
  const now = new Date().toISOString()
  const completedExercises = session.exercises.filter((exercise) => {
    const doneSets = session.setsDoneByExerciseId[exercise.id] ?? 0
    return doneSets >= exercise.sets
  })
  const totalSets = session.exercises.reduce((total, exercise) => total + exercise.sets, 0)
  const completedSets = session.exercises.reduce((total, exercise) => {
    const doneSets = session.setsDoneByExerciseId[exercise.id] ?? 0
    return total + Math.min(doneSets, exercise.sets)
  }, 0)
  const exerciseRecords = session.exercises.map((exercise) => {
    const doneSets = Math.min(session.setsDoneByExerciseId[exercise.id] ?? 0, exercise.sets)
    return {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      loadVolumeKg: Math.round(doneSets * exercise.reps * (exercise.suggestedLoadKg ?? 0)),
    }
  })
  const loadVolumeKg = exerciseRecords.reduce((total, record) => total + record.loadVolumeKg, 0)
  const previousHistory = getWorkoutHistoryEntries(studentId)
  const weeklyHistory = getWeeklyProgress(previousHistory)
  const weeklyCompletedWorkouts = weeklyHistory.length + 1
  const weeklyTargetWorkouts = Math.max(
    4,
    workoutMockRepository
      .getWorkouts(studentId)
      .filter((workout) => {
        const weekStartKey = toIsoDate(startOfWeek(new Date()))
        const weekEndKey = toIsoDate(addDays(startOfWeek(new Date()), 6))
        return workout.date >= weekStartKey && workout.date <= weekEndKey
      }).length,
  )
  const rewardStars = session.rewardStars
  const totalStars = previousHistory.reduce((total, entry) => total + entry.rewardStars, 0) + rewardStars
  const currentLevel = Math.max(1, Math.floor(totalStars / 120) + 1)
  const currentLevelFloor = (currentLevel - 1) * 120
  const nextLevelStars = currentLevel * 120
  const currentLevelStars = totalStars - currentLevelFloor

  return {
    sessionId: session.sessionId,
    studentId,
    workoutId: session.workoutId,
    title: session.title,
    startedAt: session.startedAt,
    completedAt: now,
    durationSec: Math.max(session.totalElapsedSec, 60),
    totalExercises: session.exercises.length,
    completedExercises: completedExercises.length,
    totalSets,
    completedSets,
    loadVolumeKg,
    exerciseRecords,
    rewardStars,
    streakDays: weeklyCompletedWorkouts,
    currentLevel,
    nextLevel: currentLevel + 1,
    currentLevelStars,
    nextLevelStars: nextLevelStars - currentLevelFloor,
    starsToNextLevel: Math.max(nextLevelStars - totalStars, 0),
    weeklyCompletedWorkouts,
    weeklyTargetWorkouts,
    weeklyCompletionDelta: Math.max(weeklyTargetWorkouts - weeklyCompletedWorkouts, 0),
    completionMessage: buildCompletionMessage({
      completedSets,
      totalSets,
      rewardStars,
      weeklyCompletedWorkouts,
      weeklyTargetWorkouts,
    }),
  }
}

function getSessionWorkoutId(input?: StartWorkoutSessionInput) {
  const studentId = resolveStudentId()
  const workouts = workoutMockRepository.getWorkouts(studentId)

  if (input?.workoutId) {
    return input.workoutId
  }

  const todayKey = toIsoDate(new Date())
  return (
    workouts.find((workout) => workout.date === todayKey)?.id ??
    workouts.find((workout) => workout.status !== 'completed')?.id ??
    workoutMockRepository.createQuickWorkout(undefined, studentId).id
  )
}

export const workoutMockRepositoryAdapter: WorkoutRepository = {
  source: 'mock',
  async getPlanSnapshot(): Promise<WorkoutPlanSnapshot> {
    const studentId = resolveStudentId()
    const workouts = workoutMockRepository.getWorkouts(studentId)
    const activeSession = await this.getActiveSession()
    const todayWorkout = buildTodayWorkout(studentId, workouts, activeSession)

    return {
      week: workoutMockRepository.getWeek(studentId),
      workouts,
      exercises: todayWorkout.workoutId ? getWorkoutExercises(studentId, todayWorkout.workoutId) : [],
      todayWorkout,
      permissions: buildPermissions(workouts),
      history: toHistoryEntries(getWorkoutHistoryEntries(studentId), workouts),
    }
  },
  async updateExerciseStatus(input: UpdateWorkoutExerciseStatusInput): Promise<void> {
    const studentId = resolveStudentId()
    workoutMockRepository.updateExerciseStatus(input.id, input.status, studentId)
  },
  async getWorkoutDetail(workoutId: string): Promise<WorkoutDetail | null> {
    const studentId = resolveStudentId()
    const workout = workoutMockRepository.getWorkoutById(workoutId, studentId)

    if (!workout) {
      return null
    }

    const history = getWorkoutHistoryEntries(studentId)
      .filter((entry) => entry.workoutId === workoutId)
      .map((entry) => ({
        ...entry,
        adherencePct: entry.totalSets > 0 ? Math.round((entry.completedSets / entry.totalSets) * 100) : 0,
        muscleGroups: workout.muscleGroups ?? [],
      }))

    const completedSessions = history.length
    const adherencePct =
      history.length > 0
        ? Math.round(history.reduce((total, entry) => total + entry.adherencePct, 0) / history.length)
        : workout.status === 'completed'
          ? 100
          : 0

    const exercises = getWorkoutExercises(studentId, workoutId)
    const muscleGroups = deriveWorkoutMuscleGroups(exercises, workout.muscleGroups)

    return {
      ...workout,
      muscleGroups,
      focusLabel: muscleGroups.length > 0 ? muscleGroups.join(' • ') : 'Treino de força',
      personalNote: workout.personalNote ?? getDefaultPersonalNote({ ...workout, muscleGroups }),
      adherencePct,
      completionCount: completedSessions,
      scheduledWindowLabel: getPlanWindowLabel(workout.date),
      exercises,
      recentHistory: history.slice(0, 4),
    }
  },
  async getWorkoutHistory(): Promise<WorkoutSessionSummary[]> {
    const studentId = resolveStudentId()
    return getWorkoutHistoryEntries(studentId)
  },
  async getActiveSession(): Promise<WorkoutSession | null> {
    const studentId = resolveStudentId()
    const activeSession = workoutSessionMockRepository.getActiveSession()
    return isSameStudent(activeSession, studentId) ? activeSession : null
  },
  async getLastSessionSummary(): Promise<WorkoutSessionSummary | null> {
    const studentId = resolveStudentId()
    const summary = workoutSessionMockRepository.getLastSummary()
    return isSameStudent(summary, studentId) ? summary : null
  },
  async startSession(input?: StartWorkoutSessionInput): Promise<WorkoutSession> {
    const studentId = resolveStudentId()
    const existingSession = await this.getActiveSession()
    const selectedWorkoutId = getSessionWorkoutId(input)

    if (existingSession && (!selectedWorkoutId || existingSession.workoutId === selectedWorkoutId)) {
      return existingSession
    }

    const workout = workoutMockRepository.getWorkoutById(selectedWorkoutId, studentId)
    const exercises = getWorkoutExercises(studentId, selectedWorkoutId)
    const session: WorkoutSession = {
      sessionId: crypto.randomUUID(),
      studentId,
      workoutId: selectedWorkoutId,
      startedAt: new Date().toISOString(),
      status: 'active',
      title: workout?.title ?? 'Treino do dia',
      exercises,
      setsDoneByExerciseId: Object.fromEntries(exercises.map((exercise) => [exercise.id, 0])),
      totalElapsedSec: 0,
      restTimerSec: exercises[0]?.restSec ?? 45,
      currentExerciseId: exercises[0]?.id,
      rewardStars: workout?.starsReward ?? 30,
    }

    workoutSessionMockRepository.saveActiveSession(session)
    return session
  },
  async saveSessionProgress(session: WorkoutSession): Promise<WorkoutSession> {
    workoutSessionMockRepository.saveActiveSession(session)
    return session
  },
  async completeSession(session: WorkoutSession): Promise<WorkoutSessionSummary> {
    const studentId = resolveStudentId()
    const summary = buildSessionSummary(session, studentId)
    workoutSessionMockRepository.saveLastSummary(summary)
    workoutSessionMockRepository.appendSummary(summary)
    workoutSessionMockRepository.clearActiveSession()
    workoutMockRepository.resetExercisesProgress(studentId)
    return summary
  },
  async createQuickWorkout(input?: CreateQuickWorkoutInput): Promise<WorkoutPlanSnapshot> {
    const studentId = resolveStudentId()
    workoutMockRepository.createQuickWorkout(input, studentId)
    return this.getPlanSnapshot()
  },
}
