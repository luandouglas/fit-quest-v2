import type { Macros, Meal, NutritionDay, NutritionHistoryDay, WaterLogEntry } from '@/shared/services'

export function toIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function addDays(isoDate: string, offset: number) {
  const date = new Date(`${isoDate}T12:00:00`)
  date.setDate(date.getDate() + offset)

  return toIsoDate(date)
}

export function getNowIso() {
  return new Date().toISOString()
}

export function calculateMacrosFromMeals(meals: Meal[]) {
  return meals.reduce<Macros>(
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
}

export function calculateWater(entries: WaterLogEntry[]) {
  return entries.reduce((total, entry) => total + entry.ml, 0)
}

export function recalculateDay(day: NutritionDay): NutritionDay {
  const mealMacros = calculateMacrosFromMeals(day.meals)
  const waterMl = calculateWater(day.waterLog.entries)

  return {
    ...day,
    consumed: {
      calories: mealMacros.calories,
      protein: mealMacros.protein,
      carbs: mealMacros.carbs,
      fat: mealMacros.fat,
      waterMl,
    },
  }
}

export function cloneDay(day: NutritionDay): NutritionDay {
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

export function calculateMealCompletionPct(day: NutritionDay) {
  if (!day.meals.length) {
    return 0
  }

  const doneCount = day.meals.filter((meal) => meal.status === 'done').length
  return Math.round((doneCount / day.meals.length) * 100)
}

export function isDayComplete(day: NutritionDay) {
  const hasMeals = day.meals.length > 0
  const allMealsDone = hasMeals && day.meals.every((meal) => meal.status === 'done')
  const waterDone = day.consumed.waterMl >= day.goals.waterMl

  return allMealsDone && waterDone
}

export function buildHistory(daysByDate: Record<string, NutritionDay>, anchorDate: string): NutritionHistoryDay[] {
  return Array.from({ length: 7 }, (_, index) => addDays(anchorDate, -index)).map((date) => {
    const day = daysByDate[date]

    if (!day) {
      return {
        date,
        mealsDonePct: 0,
        calories: 0,
        waterMl: 0,
        status: 'pending',
      }
    }

    const mealsDonePct = calculateMealCompletionPct(day)
    const status = isDayComplete(day) ? 'ok' : 'pending'

    return {
      date,
      mealsDonePct,
      calories: day.consumed.calories,
      waterMl: day.consumed.waterMl,
      status,
    }
  })
}

export function getInsightMessage(day: NutritionDay) {
  const proteinLeft = Math.max(day.goals.protein - day.consumed.protein, 0)
  const waterLeft = Math.max(day.goals.waterMl - day.consumed.waterMl, 0)

  if (proteinLeft > 0) {
    return `Voce esta a ${proteinLeft}g de proteina da meta diaria.`
  }

  if (waterLeft > 0) {
    return `Faltam ${waterLeft} ml de agua para bater sua hidratacao.`
  }

  return 'Otimo ritmo hoje. Continue consistente nas proximas refeicoes.'
}
