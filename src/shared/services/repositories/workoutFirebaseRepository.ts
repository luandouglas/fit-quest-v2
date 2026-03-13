import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  type CollectionReference,
  type DocumentReference,
} from 'firebase/firestore/lite'

import { authService } from '@/shared/services/authService'
import { getFirebaseFirestore } from '@/shared/services/firebase'
import type {
  CreateQuickWorkoutInput,
  StartWorkoutSessionInput,
  TodayWorkout,
  TrainingPlanDay,
  UpdateWorkoutExerciseStatusInput,
  WorkoutDetail,
  WorkoutPlanItem,
  WorkoutPlanSnapshot,
  WorkoutSessionHistoryEntry,
  WorkoutSession,
  WorkoutSessionSummary,
} from '@/shared/services/contracts/workout'

import type { WorkoutRepository } from './workoutRepository'

type FirestoreWorkoutPlanDocument = WorkoutDetail
type FirestoreExerciseStatusDocument = Record<string, WorkoutDetail['exercises'][number]['status']>

function getDb() {
  const db = getFirebaseFirestore()

  if (!db) {
    throw new Error('Firebase is not configured for workout data.')
  }

  return db
}

function resolveStudentId() {
  const session = authService.getStoredSession()

  if (!session || session.user.role !== 'STUDENT') {
    throw new Error('Authenticated student session is required for workout data.')
  }

  return session.user.id
}

function studentDoc<T>(studentId: string, ...segments: string[]) {
  return doc(getDb(), 'students', studentId, ...segments) as DocumentReference<T>
}

function studentCollection<T>(studentId: string, ...segments: string[]) {
  return collection(getDb(), 'students', studentId, ...segments) as CollectionReference<T>
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

function getWeekdayLabel(date: Date): NonNullable<WorkoutPlanItem['weekdays']>[number] {
  return ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'][date.getDay()] as NonNullable<WorkoutPlanItem['weekdays']>[number]
}

function resolveWorkoutOccurrenceStatus(
  plan: FirestoreWorkoutPlanDocument,
  date: string,
  history: WorkoutSessionSummary[],
  todayKey: string,
): WorkoutPlanItem['status'] {
  const wasCompletedOnDate = history.some(
    (entry) => entry.workoutId === plan.id && toIsoDate(new Date(entry.completedAt)) === date,
  )

  if (wasCompletedOnDate) {
    return 'completed'
  }

  if (date < todayKey) {
    return 'late'
  }

  return 'pending'
}

function expandPlanDocumentsToWeek(
  planDocuments: FirestoreWorkoutPlanDocument[],
  history: WorkoutSessionSummary[],
): WorkoutPlanItem[] {
  const weekStart = startOfWeek(new Date())
  const todayKey = toIsoDate(new Date())

  return planDocuments
    .flatMap((plan) => {
      if (plan.isActive === false) {
        return []
      }

      const weekdays = plan.weekdays?.length ? plan.weekdays : null
      const dates = weekdays
        ? Array.from({ length: 7 }, (_, index) => addDays(weekStart, index))
            .filter((date) => weekdays.includes(getWeekdayLabel(date)))
            .map((date) => toIsoDate(date))
            .filter((date) => date >= plan.date)
        : [plan.date]

      return dates.map((date) => ({
        id: plan.id,
        title: plan.title,
        description: plan.description,
        date,
        status: resolveWorkoutOccurrenceStatus(plan, date, history, todayKey),
        isActive: plan.isActive,
        estimatedDurationMin: plan.estimatedDurationMin,
        isQuickWorkout: plan.isQuickWorkout,
        frequencyWeekly: plan.frequencyWeekly,
        assignedByPersonalId: plan.assignedByPersonalId,
        muscleGroups: plan.muscleGroups,
        intensity: plan.intensity,
        starsReward: plan.starsReward,
        weekdays: plan.weekdays,
        source: plan.source,
        createdAt: plan.createdAt,
        exerciseCount: plan.exercises.length,
        personalNote: plan.personalNote,
      }))
    })
    .sort((left, right) => left.date.localeCompare(right.date) || left.title.localeCompare(right.title))
}

function calculateWorkoutStreak(history: WorkoutSessionSummary[]) {
  const uniqueDates = new Set(history.map((entry) => toIsoDate(new Date(entry.completedAt))))
  let streak = 0

  for (let offset = 0; offset < 30; offset += 1) {
    const dateKey = toIsoDate(addDays(new Date(), -offset))

    if (uniqueDates.has(dateKey)) {
      streak += 1
      continue
    }

    break
  }

  return streak
}

function getWeeklyCompletedWorkouts(history: WorkoutSessionSummary[], completedAt: string) {
  const weekStart = startOfWeek(new Date(completedAt))
  const weekEnd = addDays(weekStart, 6).getTime()

  return history.filter((entry) => {
    const entryTime = new Date(entry.completedAt).getTime()
    return entryTime >= weekStart.getTime() && entryTime <= weekEnd
  }).length
}

function toTrainingWeek(workouts: WorkoutPlanItem[]): TrainingPlanDay[] {
  const weekStart = startOfWeek(new Date())
  const todayKey = toIsoDate(new Date())

  return Array.from({ length: 7 }, (_, index) => {
    const date = toIsoDate(addDays(weekStart, index))
    const dayWorkouts = workouts.filter((workout) => workout.date === date)
    const hasWorkout = dayWorkouts.length > 0
    const isCompleted = hasWorkout && dayWorkouts.every((workout) => workout.status === 'completed')
    const status = !hasWorkout
      ? 'rest'
      : isCompleted
        ? 'completed'
        : dayWorkouts.some((workout) => workout.status === 'late')
          ? 'late'
          : 'pending'

    return {
      date,
      weekday: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'][index] ?? 'Seg',
      isToday: date === todayKey,
      isCompleted,
      hasWorkout,
      status,
    }
  })
}

function buildTodayWorkout(workouts: WorkoutPlanItem[], activeSession: WorkoutSession | null): TodayWorkout {
  if (activeSession) {
    const completedCount = activeSession.exercises.filter((exercise) => {
      const doneSets = activeSession.setsDoneByExerciseId[exercise.id] ?? 0
      return doneSets >= exercise.sets
    }).length

    return {
      workoutId: activeSession.workoutId,
      title: activeSession.title,
      durationMin: Math.max(activeSession.exercises.reduce((total, exercise) => total + exercise.durationMin, 0), 1),
      calories: Math.max(activeSession.exercises.length * 45, 120),
      stars: activeSession.rewardStars,
      progressPct: activeSession.exercises.length ? Math.round((completedCount / activeSession.exercises.length) * 100) : 0,
      completedCount,
      totalCount: activeSession.exercises.length,
      muscleGroups: activeSession.exercises
        .map((exercise) => exercise.muscleGroup)
        .filter((value): value is string => Boolean(value)),
      estimatedStartLabel: 'Sessão ativa agora',
    }
  }

  const todayKey = toIsoDate(new Date())
  const workout = workouts.find((entry) => entry.date === todayKey) ?? workouts.find((entry) => entry.status !== 'completed') ?? workouts[0]

  if (!workout) {
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

  return {
    workoutId: workout.id,
    title: workout.title,
    durationMin: workout.estimatedDurationMin,
    calories: Math.max(workout.estimatedDurationMin * 6, 120),
    stars: workout.starsReward ?? 30,
    progressPct: workout.status === 'completed' ? 100 : 0,
    completedCount: workout.status === 'completed' ? workout.exerciseCount ?? 0 : 0,
    totalCount: workout.exerciseCount ?? 0,
    muscleGroups: workout.muscleGroups,
    estimatedStartLabel: workout.date === todayKey ? 'Prioridade do dia' : 'Programado na semana',
  }
}

async function getPlanDocuments(studentId: string) {
  const snapshot = await getDocs(query(studentCollection<FirestoreWorkoutPlanDocument>(studentId, 'workoutPlans'), orderBy('date', 'asc')))
  return snapshot.docs.map((entry) => entry.data())
}

async function getHistoryDocuments(studentId: string) {
  const snapshot = await getDocs(query(studentCollection<WorkoutSessionSummary>(studentId, 'workoutSessionsHistory'), orderBy('completedAt', 'desc')))
  return snapshot.docs.map((entry) => entry.data())
}

function toHistoryEntries(history: WorkoutSessionSummary[]): WorkoutSessionHistoryEntry[] {
  return history.map((entry) => ({
    ...entry,
    adherencePct: entry.totalSets > 0 ? Math.round((entry.completedSets / entry.totalSets) * 100) : 0,
    muscleGroups: [],
  }))
}

export const workoutFirebaseRepository: WorkoutRepository = {
  source: 'firebase',
  async getPlanSnapshot(): Promise<WorkoutPlanSnapshot> {
    const studentId = resolveStudentId()
    const [planDocuments, activeSession, history] = await Promise.all([
      getPlanDocuments(studentId),
      this.getActiveSession(),
      this.getWorkoutHistory(),
    ])

    const workouts = expandPlanDocumentsToWeek(planDocuments, history)
    const todayWorkout = buildTodayWorkout(workouts, activeSession)
    const todayDetail = todayWorkout.workoutId
      ? planDocuments.find((plan) => plan.id === todayWorkout.workoutId) ?? null
      : null

    return {
      week: toTrainingWeek(workouts),
      workouts,
      exercises: todayDetail?.exercises ?? [],
      todayWorkout,
      permissions: {
        hasActivePersonal: workouts.some((workout) => Boolean(workout.assignedByPersonalId)),
        canCreateQuickWorkout: !workouts.some((workout) => Boolean(workout.assignedByPersonalId)),
        canExecuteOnlyAssigned: workouts.some((workout) => Boolean(workout.assignedByPersonalId)),
        canEditPlan: false,
      },
      history: toHistoryEntries(history),
    }
  },
  async updateExerciseStatus(input: UpdateWorkoutExerciseStatusInput): Promise<void> {
    const studentId = resolveStudentId()
    const reference = studentDoc<FirestoreExerciseStatusDocument>(studentId, 'workoutUiState', 'exerciseStatuses')
    const snapshot = await getDoc(reference)
    const current = snapshot.exists() ? snapshot.data() : {}

    await setDoc(
      reference,
      {
        ...current,
        [input.id]: input.status,
      },
      { merge: true },
    )
  },
  async getWorkoutDetail(workoutId: string): Promise<WorkoutDetail | null> {
    const studentId = resolveStudentId()
    const snapshot = await getDoc(studentDoc<FirestoreWorkoutPlanDocument>(studentId, 'workoutPlans', workoutId))

    if (!snapshot.exists()) {
      return null
    }

    return snapshot.data()
  },
  async getWorkoutHistory(): Promise<WorkoutSessionSummary[]> {
    const studentId = resolveStudentId()
    return getHistoryDocuments(studentId)
  },
  async getActiveSession(): Promise<WorkoutSession | null> {
    const studentId = resolveStudentId()
    const snapshot = await getDoc(studentDoc<WorkoutSession>(studentId, 'workoutSessions', 'active'))
    return snapshot.exists() ? snapshot.data() : null
  },
  async getLastSessionSummary(): Promise<WorkoutSessionSummary | null> {
    const history = await this.getWorkoutHistory()
    return history[0] ?? null
  },
  async startSession(input?: StartWorkoutSessionInput): Promise<WorkoutSession> {
    const studentId = resolveStudentId()
    const existingSession = await this.getActiveSession()

    if (existingSession && (!input?.workoutId || existingSession.workoutId === input.workoutId)) {
      return existingSession
    }

    const planDocuments = await getPlanDocuments(studentId)
    const selectedPlan =
      (input?.workoutId ? planDocuments.find((plan) => plan.id === input.workoutId) : null) ??
      planDocuments.find((plan) => plan.date === toIsoDate(new Date())) ??
      planDocuments.find((plan) => plan.status !== 'completed') ??
      planDocuments[0]

    if (!selectedPlan) {
      throw new Error('No workout documents found for this student.')
    }

    const session: WorkoutSession = {
      sessionId: crypto.randomUUID(),
      studentId,
      workoutId: selectedPlan.id,
      startedAt: new Date().toISOString(),
      status: 'active',
      title: selectedPlan.title,
      exercises: selectedPlan.exercises,
      setsDoneByExerciseId: Object.fromEntries(selectedPlan.exercises.map((exercise) => [exercise.id, 0])),
      totalElapsedSec: 0,
      restTimerSec: selectedPlan.exercises[0]?.restSec ?? 45,
      currentExerciseId: selectedPlan.exercises[0]?.id,
      rewardStars: selectedPlan.starsReward ?? 30,
    }

    await setDoc(studentDoc(studentId, 'workoutSessions', 'active'), session, { merge: true })
    return session
  },
  async saveSessionProgress(session: WorkoutSession): Promise<WorkoutSession> {
    const studentId = resolveStudentId()
    await setDoc(studentDoc(studentId, 'workoutSessions', 'active'), session, { merge: true })
    return session
  },
  async completeSession(session: WorkoutSession): Promise<WorkoutSessionSummary> {
    const studentId = resolveStudentId()
    const currentHistory = await this.getWorkoutHistory()
    const completedAt = new Date().toISOString()
    const totalStars = currentHistory.reduce((total, entry) => total + entry.rewardStars, 0) + session.rewardStars
    const currentLevel = Math.max(1, Math.floor(totalStars / 120) + 1)
    const currentLevelFloor = (currentLevel - 1) * 120
    const totalSets = session.exercises.reduce((total, exercise) => total + exercise.sets, 0)
    const completedSets = session.exercises.reduce(
      (total, exercise) => total + Math.min(session.setsDoneByExerciseId[exercise.id] ?? 0, exercise.sets),
      0,
    )
    const completedHistory = [
      ...currentHistory,
      {
        sessionId: session.sessionId,
        studentId,
        workoutId: session.workoutId,
        title: session.title,
        startedAt: session.startedAt,
        completedAt,
        durationSec: Math.max(session.totalElapsedSec, 60),
        totalExercises: session.exercises.length,
        completedExercises: session.exercises.filter((exercise) => (session.setsDoneByExerciseId[exercise.id] ?? 0) >= exercise.sets).length,
        totalSets,
        completedSets,
        loadVolumeKg: 0,
        exerciseRecords: [],
        rewardStars: session.rewardStars,
        streakDays: 0,
        currentLevel,
        nextLevel: currentLevel + 1,
        currentLevelStars: totalStars - currentLevelFloor,
        nextLevelStars: currentLevel * 120 - currentLevelFloor,
        starsToNextLevel: Math.max(currentLevel * 120 - totalStars, 0),
        weeklyCompletedWorkouts: 0,
        weeklyTargetWorkouts: 4,
        weeklyCompletionDelta: 0,
        completionMessage: '',
      },
    ]
    const streakDays = calculateWorkoutStreak(completedHistory)
    const weeklyCompletedWorkouts = getWeeklyCompletedWorkouts(completedHistory, completedAt)
    const summary: WorkoutSessionSummary = {
      sessionId: session.sessionId,
      studentId,
      workoutId: session.workoutId,
      title: session.title,
      startedAt: session.startedAt,
      completedAt,
      durationSec: Math.max(session.totalElapsedSec, 60),
      totalExercises: session.exercises.length,
      completedExercises: session.exercises.filter((exercise) => (session.setsDoneByExerciseId[exercise.id] ?? 0) >= exercise.sets).length,
      totalSets,
      completedSets,
      loadVolumeKg: session.exercises.reduce((total, exercise) => {
        const doneSets = Math.min(session.setsDoneByExerciseId[exercise.id] ?? 0, exercise.sets)
        return total + Math.round(doneSets * exercise.reps * (exercise.suggestedLoadKg ?? 0))
      }, 0),
      exerciseRecords: session.exercises.map((exercise) => ({
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        loadVolumeKg: Math.round(
          Math.min(session.setsDoneByExerciseId[exercise.id] ?? 0, exercise.sets) * exercise.reps * (exercise.suggestedLoadKg ?? 0),
        ),
      })),
      rewardStars: session.rewardStars,
      streakDays,
      currentLevel,
      nextLevel: currentLevel + 1,
      currentLevelStars: totalStars - currentLevelFloor,
      nextLevelStars: currentLevel * 120 - currentLevelFloor,
      starsToNextLevel: Math.max(currentLevel * 120 - totalStars, 0),
      weeklyCompletedWorkouts,
      weeklyTargetWorkouts: 4,
      weeklyCompletionDelta: Math.max(4 - weeklyCompletedWorkouts, 0),
      completionMessage: 'Treino salvo no Firebase. Continue o ritmo para sustentar seu nível.',
    }

    await Promise.all([
      setDoc(studentDoc(studentId, 'workoutSessionsHistory', summary.sessionId), summary, { merge: true }),
      setDoc(studentDoc(studentId, 'workoutSessions', 'lastSummary'), summary, { merge: true }),
      setDoc(
        studentDoc(studentId, 'workoutDays', toIsoDate(new Date(summary.completedAt))),
        {
          id: session.workoutId ?? session.sessionId,
          date: toIsoDate(new Date(summary.completedAt)),
          title: session.title,
          focus: 'Sessao concluida',
          status: 'completed',
          estimatedDurationMin: Math.max(Math.round(summary.durationSec / 60), 1),
          completionPct: 100,
          rewardStars: summary.rewardStars,
          coachNote: summary.completionMessage,
          exercises: session.exercises.map((exercise) => ({
            id: exercise.id,
            name: exercise.name,
            group: exercise.muscleGroup ?? 'Treino geral',
            sets: exercise.sets,
            reps: exercise.reps,
            restSec: exercise.restSec,
            suggestedLoadKg: exercise.suggestedLoadKg ?? 0,
            status: (session.setsDoneByExerciseId[exercise.id] ?? 0) >= exercise.sets ? 'completed' : 'pending',
          })),
        },
        { merge: true },
      ),
      session.workoutId
        ? setDoc(
            studentDoc(studentId, 'workoutPlans', session.workoutId),
            {
              status: 'completed',
              adherencePct: totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0,
              completionCount: summary.completedExercises,
            },
            { merge: true },
          )
        : Promise.resolve(),
      deleteDoc(studentDoc(studentId, 'workoutSessions', 'active')),
    ])

    return summary
  },
  async createQuickWorkout(input?: CreateQuickWorkoutInput): Promise<WorkoutPlanSnapshot> {
    const studentId = resolveStudentId()
    const date = input?.date ?? toIsoDate(new Date())
    const id = crypto.randomUUID()
    const detail: WorkoutDetail = {
      id,
      title: input?.title?.trim() || 'Treino rápido',
      date,
      status: 'pending',
      estimatedDurationMin: 20,
      isQuickWorkout: true,
      frequencyWeekly: 3,
      createdAt: new Date().toISOString(),
      starsReward: 24,
      focusLabel: 'Sessão rápida',
      personalNote: 'Treino curto para não quebrar sua consistência diária.',
      adherencePct: 0,
      completionCount: 0,
      scheduledWindowLabel: 'Disponível agora',
      exercises: [],
      recentHistory: [],
    }

    await setDoc(studentDoc(studentId, 'workoutPlans', id), detail, { merge: true })
    return this.getPlanSnapshot()
  },
}
