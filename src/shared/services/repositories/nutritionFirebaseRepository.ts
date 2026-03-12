import {
  doc,
  getDoc,
  setDoc,
  type DocumentReference,
} from 'firebase/firestore/lite'

import { authService } from '@/shared/services/authService'
import { getFirebaseFirestore } from '@/shared/services/firebase'
import type {
  AddNutritionWaterEntryInput,
  Meal,
  NutritionDay,
  NutritionDaysMap,
  NutritionDaysPayload,
  NutritionPermissions,
  UpdateNutritionMealNoteInput,
  UpdateNutritionMealStatusInput,
  UpdateNutritionWaterGoalInput,
} from '@/shared/services/contracts/nutrition'

import type { NutritionRepository } from './nutritionRepository'

const defaultPermissions: NutritionPermissions = {
  hasActiveNutritionist: true,
  canEditPlan: false,
  canRegisterConsumption: true,
  canAddMealNotes: true,
  canUpdateWater: true,
}

function getDb() {
  const db = getFirebaseFirestore()

  if (!db) {
    throw new Error('Firebase is not configured for nutrition data.')
  }

  return db
}

function resolveStudentId() {
  const session = authService.getStoredSession()

  if (!session || session.user.role !== 'STUDENT') {
    throw new Error('Authenticated student session is required for nutrition data.')
  }

  return session.user.id
}

function studentDoc<T>(studentId: string, ...segments: string[]) {
  return doc(getDb(), 'students', studentId, ...segments) as DocumentReference<T>
}

function toIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addDays(date: string, offset: number) {
  const nextDate = new Date(`${date}T12:00:00`)
  nextDate.setDate(nextDate.getDate() + offset)
  return toIsoDate(nextDate)
}

function cloneDay(day: NutritionDay): NutritionDay {
  return {
    ...day,
    goals: { ...day.goals },
    consumed: { ...day.consumed },
    meals: day.meals.map((meal) => ({
      ...meal,
      targetMacros: { ...meal.targetMacros },
      items: meal.items.map((item) => ({
        ...item,
        macros: item.macros ? { ...item.macros } : undefined,
      })),
    })),
    waterLog: {
      entries: day.waterLog.entries.map((entry) => ({ ...entry })),
    },
  }
}

function recalculateDay(day: NutritionDay): NutritionDay {
  const consumed = day.meals.reduce(
    (acc, meal) => {
      if (meal.status !== 'done') {
        return acc
      }

      return {
        calories: acc.calories + meal.targetMacros.calories,
        protein: acc.protein + meal.targetMacros.protein,
        carbs: acc.carbs + meal.targetMacros.carbs,
        fat: acc.fat + meal.targetMacros.fat,
      }
    },
    {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    },
  )

  return {
    ...day,
    consumed: {
      ...consumed,
      waterMl: day.waterLog.entries.reduce((total, entry) => total + Math.max(entry.ml, 0), 0),
    },
  }
}

async function getRequiredDay(studentId: string, date: string) {
  const reference = studentDoc<NutritionDay>(studentId, 'nutritionDays', date)
  const snapshot = await getDoc(reference)

  if (!snapshot.exists()) {
    throw new Error('Nao foi possivel localizar o plano alimentar desta data.')
  }

  return {
    reference,
    day: cloneDay(snapshot.data()),
  }
}

async function persistDay(reference: DocumentReference<NutritionDay>, day: NutritionDay) {
  const nextDay = recalculateDay(day)
  await setDoc(reference, nextDay, { merge: true })
  return nextDay
}

function updateMeal(day: NutritionDay, mealId: string, updater: (meal: Meal) => Meal) {
  return {
    ...day,
    meals: day.meals.map((meal) => (meal.id === mealId ? updater(meal) : meal)),
  }
}

export const nutritionFirebaseRepository: NutritionRepository = {
  source: 'firebase',
  getDaysSnapshot() {
    return {}
  },
  saveDaysSnapshot() {},
  async getDays(anchorDate: string): Promise<NutritionDaysPayload> {
    const studentId = resolveStudentId()
    const dates = Array.from({ length: 8 }, (_, index) => addDays(anchorDate, index - 6))
    const snapshots = await Promise.all(
      dates.map((date) => getDoc(studentDoc<NutritionDay>(studentId, 'nutritionDays', date))),
    )

    const daysByDate = snapshots.reduce<NutritionDaysMap>((acc, snapshot, index) => {
      if (!snapshot.exists()) {
        return acc
      }

      acc[dates[index]!] = recalculateDay(snapshot.data())
      return acc
    }, {})

    return {
      daysByDate,
      permissions: defaultPermissions,
    }
  },
  async updateMealStatus(input: UpdateNutritionMealStatusInput): Promise<NutritionDay> {
    const studentId = resolveStudentId()
    const { reference, day } = await getRequiredDay(studentId, input.date)

    return persistDay(
      reference,
      updateMeal(day, input.mealId, (meal) => ({
        ...meal,
        status: input.status,
        completedAt: input.status === 'done' ? new Date().toISOString() : undefined,
      })),
    )
  },
  async updateMealNote(input: UpdateNutritionMealNoteInput): Promise<NutritionDay> {
    const studentId = resolveStudentId()
    const { reference, day } = await getRequiredDay(studentId, input.date)

    return persistDay(
      reference,
      updateMeal(day, input.mealId, (meal) => ({
        ...meal,
        note: input.note.trim(),
      })),
    )
  },
  async addWaterEntry(input: AddNutritionWaterEntryInput): Promise<NutritionDay> {
    const studentId = resolveStudentId()
    const { reference, day } = await getRequiredDay(studentId, input.date)

    return persistDay(reference, {
      ...day,
      waterLog: {
        entries: [
          ...day.waterLog.entries,
          {
            id: `${input.date}-water-${crypto.randomUUID()}`,
            ml: Math.max(input.ml, 0),
            at: new Date().toISOString(),
          },
        ],
      },
    })
  },
  async removeLastWaterEntry(input): Promise<NutritionDay> {
    const studentId = resolveStudentId()
    const { reference, day } = await getRequiredDay(studentId, input.date)

    return persistDay(reference, {
      ...day,
      waterLog: {
        entries: day.waterLog.entries.slice(0, -1),
      },
    })
  },
  async updateWaterGoal(input: UpdateNutritionWaterGoalInput): Promise<NutritionDay> {
    const studentId = resolveStudentId()
    const { reference, day } = await getRequiredDay(studentId, input.date)

    return persistDay(reference, {
      ...day,
      goals: {
        ...day.goals,
        waterMl: input.waterMl,
      },
    })
  },
}
