import type { AuthSession, AuthUser } from '@/shared/types'
import type { NutritionDaysMap } from '@/shared/services/contracts/nutrition'
import type { WorkoutSession, WorkoutSessionSummary } from '@/shared/services/contracts/workout'
import { HttpError } from '@/shared/services/http'
import { registerMockHandler } from '@/shared/services/http'
import { createNutritionMockDays } from '@/shared/services/mocks/nutritionMockData'
import { workoutMockRepository } from '@/shared/services/repositories/workoutMockRepository'
import { workoutSessionMockRepository } from '@/shared/services/repositories/workoutSessionMockRepository'
import { storage } from '@/shared/services/storage'

type LoginRequest = {
  email: string
  password: string
}

type LoginResponse = {
  session: AuthSession
}

type NutritionDaysResponse = {
  daysByDate: NutritionDaysMap
}

function toIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function createWorkoutSession(): WorkoutSession {
  const exercises = workoutMockRepository.getExercises()
  const setsDoneByExerciseId = exercises.reduce<Record<string, number>>((acc, exercise) => {
    acc[exercise.id] = 0
    return acc
  }, {})

  return {
    sessionId: crypto.randomUUID(),
    startedAt: new Date().toISOString(),
    status: 'active',
    title: 'Upper Body Day',
    exercises,
    setsDoneByExerciseId,
    totalElapsedSec: 0,
    restTimerSec: 45,
  }
}

function createWorkoutSummary(session: WorkoutSession): WorkoutSessionSummary {
  const completedAt = new Date().toISOString()
  const durationSec = Math.max(
    session.totalElapsedSec,
    Math.max(Math.round((Date.parse(completedAt) - Date.parse(session.startedAt)) / 1000), 0),
  )

  const totalSets = session.exercises.reduce((total, exercise) => total + exercise.sets, 0)
  const completedSets = session.exercises.reduce((total, exercise) => {
    const done = session.setsDoneByExerciseId[exercise.id] ?? 0
    return total + Math.min(done, exercise.sets)
  }, 0)

  const completedExercises = session.exercises.filter((exercise) => {
    const done = session.setsDoneByExerciseId[exercise.id] ?? 0
    return done >= exercise.sets
  }).length

  return {
    sessionId: session.sessionId,
    title: session.title,
    startedAt: session.startedAt,
    completedAt,
    durationSec,
    totalExercises: session.exercises.length,
    completedExercises,
    totalSets,
    completedSets,
  }
}

let isRegistered = false

export function registerMockHandlers() {
  if (isRegistered) {
    return
  }

  registerMockHandler<LoginResponse>('POST', '/auth/login', (request) => {
    const body = (request.body ?? {}) as Partial<LoginRequest>
    const email = body.email?.trim() ?? 'atleta@fitquest.app'
    const password = body.password?.trim() ?? ''

    if (password.toLowerCase() === 'invalid') {
      throw new HttpError('Invalid credentials', {
        status: 401,
        code: 'http_error',
        data: { message: 'Invalid credentials' },
        request,
      })
    }

    const displayName = email.split('@')[0]?.trim() || 'atleta'

    const user: AuthUser = {
      id: crypto.randomUUID(),
      name: displayName,
    }

    const response: LoginResponse = {
      session: {
        accessToken: `mock-access-${crypto.randomUUID()}`,
        refreshToken: `mock-refresh-${crypto.randomUUID()}`,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        user,
      },
    }

    return { data: response }
  })

  registerMockHandler<null>('POST', '/auth/logout', () => {
    return { data: null }
  })

  registerMockHandler<NutritionDaysResponse>('GET', '/nutrition/days', (request) => {
    const url = new URL(request.url, window.location.origin)
    const anchorDate = url.searchParams.get('anchorDate') ?? toIsoDate(new Date())
    const cached = storage.get<NutritionDaysMap>('fitquest.nutrition.days')

    const daysByDate = cached && Object.keys(cached).length > 0 ? cached : createNutritionMockDays(anchorDate)

    return {
      data: {
        daysByDate,
      },
    }
  })

  registerMockHandler('GET', '/workouts/plan/snapshot', () => {
    const exercises = workoutMockRepository.getExercises()
    const doneCount = exercises.filter((exercise) => exercise.status === 'done').length
    const totalCount = exercises.length
    const progressPct = Math.round((doneCount / Math.max(totalCount, 1)) * 100)

    return {
      data: {
        week: workoutMockRepository.getWeek(),
        exercises,
        todayWorkout: workoutMockRepository.getTodayWorkout(progressPct, doneCount, totalCount),
      },
    }
  })

  registerMockHandler<WorkoutSession>('POST', '/workouts/session/start', () => {
    const existingSession = workoutSessionMockRepository.getActiveSession()

    if (existingSession && existingSession.status !== 'completed') {
      return { data: existingSession }
    }

    const session = createWorkoutSession()
    workoutSessionMockRepository.saveActiveSession(session)

    return { data: session }
  })

  registerMockHandler<WorkoutSession>('PATCH', '/workouts/session/progress', (request) => {
    const body = (request.body ?? {}) as { session?: WorkoutSession }

    if (!body.session) {
      throw new HttpError('Session payload is required', {
        status: 400,
        code: 'http_error',
        data: { message: 'Session payload is required' },
        request,
      })
    }

    workoutSessionMockRepository.saveActiveSession(body.session)

    return { data: body.session }
  })

  registerMockHandler<WorkoutSessionSummary>('POST', '/workouts/session/complete', (request) => {
    const body = (request.body ?? {}) as { session?: WorkoutSession }

    if (!body.session) {
      throw new HttpError('Session payload is required', {
        status: 400,
        code: 'http_error',
        data: { message: 'Session payload is required' },
        request,
      })
    }

    const completedSession: WorkoutSession = {
      ...body.session,
      status: 'completed',
      completedAt: new Date().toISOString(),
    }

    const summary = createWorkoutSummary(completedSession)

    workoutSessionMockRepository.saveLastSummary(summary)
    workoutSessionMockRepository.clearActiveSession()

    return { data: summary }
  })

  isRegistered = true
}
