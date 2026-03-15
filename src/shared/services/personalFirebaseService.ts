import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  where,
} from 'firebase/firestore/lite'

import { authService } from '@/shared/services/authService'
import { getFirebaseFirestore } from '@/shared/services/firebase'
import type {
  CreatePersonalWorkoutInput,
  DeactivatePersonalWorkoutInput,
  PersonalAssignedWorkout,
  PersonalDashboardOverview,
  PersonalMetrics,
  PersonalStudent,
  PersonalStudentInviteLink,
  PersonalStudentWorkoutHistory,
  UpdatePersonalWorkoutInput,
} from '@/shared/services/contracts/personal'
import type { MeasurementsUpdateRequest } from '@/shared/services/contracts/requests'
import type { WorkoutDetail, WorkoutExercise, WorkoutSessionSummary } from '@/shared/services/contracts/workout'
import type { AuthUserRole, ProfessionalProfile } from '@/shared/types'

type FirebaseUserDocument = {
  email?: string
  name?: string
  role?: AuthUserRole
  professionalProfile?: ProfessionalProfile
}

type ProfileSettingsDocument = {
  goals?: {
    workoutsPerWeek?: number
  }
}

function getDb() {
  const db = getFirebaseFirestore()

  if (!db) {
    throw new Error('Firebase is not configured for personal data.')
  }

  return db
}

function resolvePersonalId() {
  const session = authService.getStoredSession()

  if (!session || session.user.role !== 'PERSONAL') {
    throw new Error('Authenticated personal session is required for Firebase access.')
  }

  return session.user.id
}

function resolvePersonalSession() {
  const session = authService.getStoredSession()

  if (!session || session.user.role !== 'PERSONAL') {
    throw new Error('Authenticated personal session is required for Firebase access.')
  }

  return session
}

function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'PT-'
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

function safeRound(value: unknown, fallback: number, min: number, max: number) {
  const parsed = Number(value)

  if (!Number.isFinite(parsed)) {
    return fallback
  }

  return Math.min(Math.max(Math.round(parsed), min), max)
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

function omitUndefined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined)) as T
}

function buildWorkoutExercises(input: CreatePersonalWorkoutInput['exercises']): WorkoutExercise[] {
  return input.map((exercise, index) =>
    omitUndefined({
      id: exercise.id?.trim() || crypto.randomUUID(),
      name: exercise.name.trim(),
      sets: safeRound(exercise.sets, 3, 1, 8),
      reps: safeRound(exercise.reps, 12, 1, 30),
      restSec: safeRound(exercise.restSec, 60, 20, 300),
      suggestedLoadKg: Math.max(0, Number(exercise.suggestedLoadKg ?? 0)),
      muscleGroup: exercise.muscleGroup?.trim() || undefined,
      equipment: exercise.equipment?.trim() || undefined,
      durationMin: safeRound(exercise.durationMin, 6, 2, 30),
      supportMedia: exercise.supportMedia ?? null,
      order: index,
      status: 'upcoming',
    }),
  )
}

function toPersonalWorkoutExercises(exercises: WorkoutExercise[]) {
  return exercises.map((exercise) => ({
    id: exercise.id,
    name: exercise.name,
    sets: exercise.sets,
    reps: exercise.reps,
    restSec: exercise.restSec,
    suggestedLoadKg: exercise.suggestedLoadKg ?? 0,
    muscleGroup: exercise.muscleGroup,
    equipment: exercise.equipment,
    durationMin: exercise.durationMin,
    supportMedia: exercise.supportMedia ?? null,
    order: exercise.order,
  }))
}

async function getStudentUsers() {
  const snapshot = await getDocs(query(collection(getDb(), 'users'), where('role', '==', 'STUDENT')))

  return snapshot.docs
    .map((entry) => ({
      id: entry.id,
      ...(entry.data() as FirebaseUserDocument),
    }))
    .sort((left, right) =>
      (left.name?.trim() || left.email || left.id).localeCompare(
        right.name?.trim() || right.email || right.id,
        'pt-BR',
      ),
    )
}

async function buildStudents() {
  const db = getDb()
  const users = await getStudentUsers()

  return Promise.all(
    users.map(async (user): Promise<PersonalStudent> => {
      const [profileSettingsSnapshot, workoutPlansSnapshot] = await Promise.all([
        getDoc(doc(db, 'students', user.id, 'profile', 'settings')),
        getDocs(collection(db, 'students', user.id, 'workoutPlans')),
      ])

      const profileSettings = profileSettingsSnapshot.exists()
        ? (profileSettingsSnapshot.data() as ProfileSettingsDocument)
        : null

      return {
        id: user.id,
        name: user.name?.trim() || user.email?.split('@')[0]?.trim() || 'Aluno',
        email: user.email?.trim() || '',
        workoutsPerWeekTarget: safeRound(profileSettings?.goals?.workoutsPerWeek, 4, 1, 14),
        activeWorkouts: workoutPlansSnapshot.docs
          .map((entry) => entry.data() as WorkoutDetail)
          .filter((workout) => workout.isActive !== false).length,
      }
    }),
  )
}

function toAssignedWorkout(detail: WorkoutDetail, student: PersonalStudent): PersonalAssignedWorkout {
  return {
    id: detail.id,
    studentId: student.id,
    studentName: student.name,
    assignmentScope: 'student',
    title: detail.title,
    description: detail.description,
    date: detail.date,
    isActive: detail.isActive !== false,
    frequencyWeekly: detail.frequencyWeekly ?? 3,
    exercisesCount: detail.exercises.length,
    muscleGroups: detail.muscleGroups ?? [],
    intensity: detail.intensity,
    starsReward: detail.starsReward ?? 0,
    estimatedDurationMin: detail.estimatedDurationMin ?? 0,
    weekdays: detail.weekdays ?? [],
    source: detail.source ?? 'manual',
    exercises: toPersonalWorkoutExercises(detail.exercises),
    createdAt: detail.createdAt ?? new Date().toISOString(),
  }
}

async function buildAssignedWorkouts(personalId: string, students: PersonalStudent[]) {
  const db = getDb()
  const workoutsByStudent = await Promise.all(
    students.map(async (student) => {
      const snapshot = await getDocs(
        query(collection(db, 'students', student.id, 'workoutPlans'), orderBy('date', 'desc')),
      )

      return snapshot.docs
        .map((entry) => entry.data() as WorkoutDetail)
        .filter((workout) => workout.assignedByPersonalId === personalId)
        .map((workout) => toAssignedWorkout(workout, student))
    }),
  )

  return workoutsByStudent
    .flat()
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))
}

function buildMetrics(students: PersonalStudent[], workouts: PersonalAssignedWorkout[]): PersonalMetrics {
  const currentWeekStart = startOfWeek(new Date()).getTime()
  const workoutsAssignedThisWeek = workouts.filter((workout) => Date.parse(workout.createdAt) >= currentWeekStart).length

  return {
    linkedStudents: students.length,
    workoutsAssignedThisWeek,
    avgFrequencyWeekly:
      students.length > 0
        ? students.reduce((total, student) => total + student.workoutsPerWeekTarget, 0) / students.length
        : 0,
    completedWorkoutsThisWeek: 0,
    studentFrequency: students.map((student) => ({
      studentId: student.id,
      studentName: student.name,
      completedWorkoutsThisWeek: 0,
      targetWorkoutsPerWeek: Math.max(student.workoutsPerWeekTarget, 1),
      frequencyPct: 0,
    })),
    loadEvolution: [],
    alerts: [],
  }
}

async function assertStudentExists(studentId: string) {
  const snapshot = await getDoc(doc(getDb(), 'users', studentId))

  if (!snapshot.exists() || snapshot.data().role !== 'STUDENT') {
    throw new Error('Aluno nao encontrado no Firebase.')
  }
}

export const personalFirebaseService = {
  async getDashboardOverview(): Promise<PersonalDashboardOverview> {
    const personalId = resolvePersonalId()
    const students = await buildStudents()
    const workouts = await buildAssignedWorkouts(personalId, students)

    return {
      students,
      workouts,
      metrics: buildMetrics(students, workouts),
      measurementRequests: [] satisfies MeasurementsUpdateRequest[],
    }
  },
  async createWorkout(input: CreatePersonalWorkoutInput): Promise<PersonalDashboardOverview> {
    const personalId = resolvePersonalId()
    const studentId = input.studentId?.trim()

    if (!studentId) {
      throw new Error('Selecione um aluno para salvar o treino.')
    }

    await assertStudentExists(studentId)

    const workoutId = crypto.randomUUID()
    const detail: WorkoutDetail = omitUndefined({
      id: workoutId,
      title: input.title.trim(),
      description: input.description?.trim() || undefined,
      date: input.date?.trim() || toIsoDate(new Date()),
      status: 'pending',
      isActive: true,
      frequencyWeekly: safeRound(input.frequencyWeekly, 3, 1, 14),
      assignedByPersonalId: personalId,
      muscleGroups: input.muscleGroups ?? [],
      intensity: input.intensity ?? 'intermediario',
      starsReward: safeRound(input.starsReward, 90, 1, 500),
      estimatedDurationMin: safeRound(input.estimatedDurationMin, 45, 10, 240),
      weekdays: input.weekdays ?? ['Seg', 'Qua', 'Sex'],
      source: input.source ?? 'manual',
      createdAt: new Date().toISOString(),
      isQuickWorkout: false,
      focusLabel: input.muscleGroups?.slice(0, 2).join(' • ') || 'Treino personalizado',
      personalNote: 'Treino atribuido pelo personal.',
      adherencePct: 0,
      completionCount: 0,
      scheduledWindowLabel: 'Programado',
      exercises: buildWorkoutExercises(input.exercises),
      recentHistory: [],
    }) as WorkoutDetail

    await setDoc(doc(getDb(), 'students', studentId, 'workoutPlans', workoutId), detail, { merge: true })
    return this.getDashboardOverview()
  },
  async updateWorkout(input: UpdatePersonalWorkoutInput): Promise<PersonalDashboardOverview> {
    const personalId = resolvePersonalId()

    if (!input.studentId?.trim() || !input.workoutId?.trim()) {
      throw new Error('studentId e workoutId sao obrigatorios.')
    }

    const reference = doc(getDb(), 'students', input.studentId, 'workoutPlans', input.workoutId)
    const snapshot = await getDoc(reference)

    if (!snapshot.exists()) {
      throw new Error('Treino nao encontrado.')
    }

    const current = snapshot.data() as WorkoutDetail

    if (current.assignedByPersonalId !== personalId) {
      throw new Error('Voce nao pode editar um treino criado por outro personal.')
    }

    await setDoc(
      reference,
      omitUndefined({
        title: input.title?.trim() || current.title,
        description: input.description?.trim() || current.description,
        date: input.date?.trim() || current.date,
        frequencyWeekly: safeRound(input.frequencyWeekly, current.frequencyWeekly ?? 3, 1, 14),
        muscleGroups: input.muscleGroups ?? current.muscleGroups ?? [],
        intensity: input.intensity ?? current.intensity ?? 'intermediario',
        starsReward: safeRound(input.starsReward, current.starsReward ?? 90, 1, 500),
        estimatedDurationMin: safeRound(input.estimatedDurationMin, current.estimatedDurationMin ?? 45, 10, 240),
        weekdays: input.weekdays ?? current.weekdays ?? ['Seg', 'Qua', 'Sex'],
        source: input.source ?? current.source ?? 'manual',
        exercises: input.exercises ? buildWorkoutExercises(input.exercises) : current.exercises,
      }) satisfies Partial<WorkoutDetail>,
      { merge: true },
    )

    return this.getDashboardOverview()
  },
  async deactivateWorkout(input: DeactivatePersonalWorkoutInput): Promise<PersonalDashboardOverview> {
    const personalId = resolvePersonalId()
    const reference = doc(getDb(), 'students', input.studentId, 'workoutPlans', input.workoutId)
    const snapshot = await getDoc(reference)

    if (!snapshot.exists()) {
      throw new Error('Treino nao encontrado.')
    }

    const current = snapshot.data() as WorkoutDetail

    if (current.assignedByPersonalId !== personalId) {
      throw new Error('Voce nao pode desativar um treino criado por outro personal.')
    }

    await setDoc(reference, { isActive: false, status: 'late' }, { merge: true })
    return this.getDashboardOverview()
  },
  async getStudentWorkoutHistory(studentId: string): Promise<PersonalStudentWorkoutHistory> {
    await assertStudentExists(studentId)

    const [userSnapshot, historySnapshot] = await Promise.all([
      getDoc(doc(getDb(), 'users', studentId)),
      getDocs(query(collection(getDb(), 'students', studentId, 'workoutSessionsHistory'), orderBy('completedAt', 'desc'))),
    ])

    const user = userSnapshot.data() as FirebaseUserDocument | undefined
    const sessions = historySnapshot.docs.map((entry) => entry.data() as WorkoutSessionSummary)

    return {
      studentId,
      studentName: user?.name?.trim() || user?.email?.split('@')[0]?.trim() || 'Aluno',
      sessions: sessions.map((session) => ({
        sessionId: session.sessionId,
        title: session.title,
        completedAt: session.completedAt,
        durationSec: session.durationSec,
        completedSets: session.completedSets,
        totalSets: session.totalSets,
      })),
    }
  },
  async generateStudentInviteLink(): Promise<PersonalStudentInviteLink> {
    const session = resolvePersonalSession()
    const personalId = session.user.id
    const personalName = session.user.name || 'Personal'
    const code = generateInviteCode()
    const db = getDb()

    await setDoc(doc(db, 'personalInvites', code), {
      code,
      personalId,
      personalName,
      personalRole: 'PERSONAL',
      createdAt: new Date().toISOString(),
      status: 'active',
    })

    const inviteLink = `${window.location.origin}/tabs/profile?invite=${code}`

    return { code, inviteLink }
  },
}
