import type { AuthSession, AuthUser } from '@/shared/types'
import type { GamificationOverview } from '@/shared/services/contracts/gamification'
import type { NutritionDaysMap } from '@/shared/services/contracts/nutrition'
import type { ProgressOverview } from '@/shared/services/contracts/progress'
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

function isSameDate(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  )
}

function createProgressOverview(history: WorkoutSessionSummary[]): ProgressOverview {
  const now = new Date()
  const weekStart = startOfWeek(now)
  const chart = Array.from({ length: 7 }, (_, offset) => {
    const date = addDays(weekStart, offset)
    const entries = history.filter((item) => isSameDate(new Date(item.completedAt), date))

    return {
      date: toIsoDate(date),
      completedTrainings: entries.length,
      durationMin: entries.reduce((total, item) => total + Math.round(item.durationSec / 60), 0),
    }
  })

  const weeklyEntries = history.filter((item) => new Date(item.completedAt) >= weekStart)
  const completedTrainings = weeklyEntries.length
  const totalDurationMin = weeklyEntries.reduce((total, item) => total + Math.round(item.durationSec / 60), 0)
  const averageCompletionPct =
    weeklyEntries.length > 0
      ? Math.round(
          weeklyEntries.reduce((total, item) => {
            const totalSets = Math.max(item.totalSets, 1)
            return total + (item.completedSets / totalSets) * 100
          }, 0) / weeklyEntries.length,
        )
      : 0

  return {
    weeklySummary: {
      completedTrainings,
      targetTrainings: 5,
      totalDurationMin,
      averageCompletionPct,
    },
    chart,
    recentHistory: history.slice(0, 8).map((item) => ({
      sessionId: item.sessionId,
      title: item.title,
      completedAt: item.completedAt,
      durationSec: item.durationSec,
      completedSets: item.completedSets,
      totalSets: item.totalSets,
    })),
  }
}

function weekKey(date: Date) {
  return toIsoDate(startOfWeek(date))
}

function createGamificationOverview(history: WorkoutSessionSummary[]): GamificationOverview {
  const now = new Date()
  const currentWeekStart = startOfWeek(now)
  const sessionsByWeek = new Map<string, number>()
  const sessionsByDay = new Map<string, number>()

  history.forEach((item) => {
    const completedAt = new Date(item.completedAt)
    const key = weekKey(completedAt)
    sessionsByWeek.set(key, (sessionsByWeek.get(key) ?? 0) + 1)

    const dayKey = toIsoDate(completedAt)
    sessionsByDay.set(dayKey, (sessionsByDay.get(dayKey) ?? 0) + 1)
  })

  const totalXp = history.reduce((total, item) => total + 120 + item.completedSets * 10, 0)
  const levelBase = 500
  const level = Math.floor(totalXp / levelBase) + 1
  const currentLevelXp = totalXp % levelBase
  const weeklyXp = history
    .filter((item) => new Date(item.completedAt) >= currentWeekStart)
    .reduce((total, item) => total + 120 + item.completedSets * 10, 0)

  let weeklyStreak = 0
  for (let offset = 0; offset < 12; offset += 1) {
    const date = addDays(currentWeekStart, -7 * offset)
    const key = weekKey(date)
    const sessions = sessionsByWeek.get(key) ?? 0

    if (sessions >= 2) {
      weeklyStreak += 1
      continue
    }

    break
  }

  const activityHeatmap = Array.from({ length: 14 }, (_, offset) => {
    const date = addDays(now, -13 + offset)
    const key = toIsoDate(date)

    return {
      date: key,
      value: sessionsByDay.get(key) ?? 0,
    }
  })

  const weeklySessions = sessionsByWeek.get(weekKey(now)) ?? 0
  const hasPerfectSession = history.some((item) => item.completedSets >= item.totalSets)

  return {
    level,
    currentLevelXp,
    nextLevelXp: levelBase,
    weeklyStreak,
    weeklyXp,
    weeklyXpTarget: 900,
    activityHeatmap,
    badges: [
      {
        id: 'first-session',
        title: 'Primeiro treino',
        description: 'Conclua sua primeira sessao.',
        icon: 'trophy',
        unlocked: history.length >= 1,
      },
      {
        id: 'consistency',
        title: 'Consistencia semanal',
        description: 'Complete 3 treinos na mesma semana.',
        icon: 'flame',
        unlocked: weeklySessions >= 3,
      },
      {
        id: 'perfect-sets',
        title: 'Series perfeitas',
        description: 'Complete todas as series de uma sessao.',
        icon: 'target',
        unlocked: hasPerfectSession,
      },
      {
        id: 'streak-runner',
        title: 'Streak runner',
        description: 'Mantenha 2 semanas seguidas com 2+ treinos.',
        icon: 'star',
        unlocked: weeklyStreak >= 2,
      },
    ],
  }
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
    workoutSessionMockRepository.appendSummary(summary)
    workoutSessionMockRepository.clearActiveSession()

    return { data: summary }
  })

  registerMockHandler<ProgressOverview>('GET', '/progress/overview', () => {
    const history = workoutSessionMockRepository.getHistory()
    return {
      data: createProgressOverview(history),
    }
  })

  registerMockHandler<GamificationOverview>('GET', '/gamification/overview', () => {
    const history = workoutSessionMockRepository.getHistory()
    return {
      data: createGamificationOverview(history),
    }
  })

  isRegistered = true
}
