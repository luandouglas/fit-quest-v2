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
import { nutritionMockRepository } from './nutritionMockRepository'

const defaultPermissions: NutritionPermissions = {
  hasActiveNutritionist: true,
  canEditPlan: false,
  canRegisterConsumption: true,
  canAddMealNotes: true,
  canUpdateWater: true,
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

function calculateConsumed(day: NutritionDay) {
  const macros = day.meals.reduce(
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
    ...macros,
    waterMl: day.waterLog.entries.reduce((total, entry) => total + Math.max(entry.ml, 0), 0),
  }
}

function recalculateDay(day: NutritionDay): NutritionDay {
  return {
    ...day,
    consumed: calculateConsumed(day),
  }
}

function getRequiredDay(days: NutritionDaysMap, date: string) {
  const day = days[date]

  if (!day) {
    throw new Error('Nao foi possivel localizar o plano alimentar desta data.')
  }

  return cloneDay(day)
}

function updateDay(days: NutritionDaysMap, date: string, updater: (day: NutritionDay) => NutritionDay) {
  const current = getRequiredDay(days, date)
  const nextDay = recalculateDay(updater(current))
  const nextDays = {
    ...days,
    [date]: nextDay,
  }

  nutritionMockRepository.saveDaysSnapshot(nextDays)
  return nextDay
}

function updateMeal(day: NutritionDay, mealId: string, updater: (meal: Meal) => Meal) {
  return {
    ...day,
    meals: day.meals.map((meal) => (meal.id === mealId ? updater(meal) : meal)),
  }
}

export const nutritionMockRepositoryAdapter: NutritionRepository = {
  source: 'mock',
  getDaysSnapshot(anchorDate?: string) {
    return nutritionMockRepository.getDaysSnapshot(anchorDate)
  },
  saveDaysSnapshot(days: NutritionDaysMap) {
    nutritionMockRepository.saveDaysSnapshot(days)
  },
  async getDays(anchorDate: string): Promise<NutritionDaysPayload> {
    return {
      daysByDate: nutritionMockRepository.getDaysSnapshot(anchorDate),
      permissions: defaultPermissions,
    }
  },
  async updateMealStatus(input: UpdateNutritionMealStatusInput): Promise<NutritionDay> {
    const days = nutritionMockRepository.getDaysSnapshot(input.date)

    return updateDay(days, input.date, (day) =>
      updateMeal(day, input.mealId, (meal) => ({
        ...meal,
        status: input.status,
        completedAt: input.status === 'done' ? new Date().toISOString() : undefined,
      })),
    )
  },
  async updateMealNote(input: UpdateNutritionMealNoteInput): Promise<NutritionDay> {
    const days = nutritionMockRepository.getDaysSnapshot(input.date)

    return updateDay(days, input.date, (day) =>
      updateMeal(day, input.mealId, (meal) => ({
        ...meal,
        note: input.note.trim(),
      })),
    )
  },
  async addWaterEntry(input: AddNutritionWaterEntryInput): Promise<NutritionDay> {
    const days = nutritionMockRepository.getDaysSnapshot(input.date)

    return updateDay(days, input.date, (day) => ({
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
    }))
  },
  async removeLastWaterEntry(input): Promise<NutritionDay> {
    const days = nutritionMockRepository.getDaysSnapshot(input.date)

    return updateDay(days, input.date, (day) => ({
      ...day,
      waterLog: {
        entries: day.waterLog.entries.slice(0, -1),
      },
    }))
  },
  async updateWaterGoal(input: UpdateNutritionWaterGoalInput): Promise<NutritionDay> {
    const days = nutritionMockRepository.getDaysSnapshot(input.date)

    return updateDay(days, input.date, (day) => ({
      ...day,
      goals: {
        ...day.goals,
        waterMl: input.waterMl,
      },
    }))
  },
}
