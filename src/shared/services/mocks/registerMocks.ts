import type { AuthSession, AuthUser } from '@/shared/types'
import type { NutritionDaysMap } from '@/shared/services/contracts/nutrition'
import { HttpError } from '@/shared/services/http'
import { registerMockHandler } from '@/shared/services/http'
import { createNutritionMockDays } from '@/shared/services/mocks/nutritionMockData'
import { workoutMockRepository } from '@/shared/services/repositories/workoutMockRepository'
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

  isRegistered = true
}
