import type { Meal, NutritionDay, NutritionDaysMap, WaterLogEntry } from '@/shared/services/contracts/nutrition'

function toIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function addDays(isoDate: string, offset: number) {
  const date = new Date(`${isoDate}T12:00:00`)
  date.setDate(date.getDate() + offset)

  return toIsoDate(date)
}

function nowIso() {
  return new Date().toISOString()
}

function calculateMacrosFromMeals(meals: Meal[]) {
  return meals.reduce(
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

function calculateWater(entries: WaterLogEntry[]) {
  return entries.reduce((total, entry) => total + entry.ml, 0)
}

function recalculateDay(day: NutritionDay): NutritionDay {
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

function createMealBlueprints() {
  return [
    {
      id: 'breakfast',
      name: 'Cafe da manha',
      time: '07:30',
      targetMacros: { calories: 430, protein: 30, carbs: 48, fat: 14 },
      items: [
        {
          id: 'breakfast-1',
          label: 'Omelete com 2 ovos e queijo branco',
          qty: '2 unidades',
          macros: { calories: 250, protein: 22, carbs: 4, fat: 16 },
        },
        {
          id: 'breakfast-2',
          label: 'Pao integral com fruta',
          qty: '1 porcao',
          macros: { calories: 180, protein: 8, carbs: 44, fat: 2 },
        },
      ],
    },
    {
      id: 'lunch',
      name: 'Almoco',
      time: '12:30',
      targetMacros: { calories: 680, protein: 44, carbs: 76, fat: 20 },
      items: [
        {
          id: 'lunch-1',
          label: 'Frango grelhado, arroz e feijao',
          qty: '150g + 120g + 80g',
          macros: { calories: 540, protein: 40, carbs: 70, fat: 12 },
        },
        {
          id: 'lunch-2',
          label: 'Salada com azeite',
          qty: '1 prato',
          macros: { calories: 140, protein: 4, carbs: 6, fat: 8 },
        },
      ],
    },
    {
      id: 'snack',
      name: 'Lanche',
      time: '16:30',
      targetMacros: { calories: 320, protein: 20, carbs: 28, fat: 10 },
      items: [
        {
          id: 'snack-1',
          label: 'Iogurte natural com aveia',
          qty: '1 pote + 30g',
          macros: { calories: 220, protein: 16, carbs: 22, fat: 6 },
        },
        {
          id: 'snack-2',
          label: 'Castanhas',
          qty: '20g',
          macros: { calories: 100, protein: 4, carbs: 6, fat: 4 },
        },
      ],
    },
    {
      id: 'dinner',
      name: 'Jantar',
      time: '20:00',
      targetMacros: { calories: 570, protein: 36, carbs: 56, fat: 18 },
      items: [
        {
          id: 'dinner-1',
          label: 'Peixe com batata doce e legumes',
          qty: '160g + 140g + 100g',
          macros: { calories: 520, protein: 34, carbs: 52, fat: 16 },
        },
        {
          id: 'dinner-2',
          label: 'Iogurte light',
          qty: '1 unidade',
          macros: { calories: 50, protein: 2, carbs: 4, fat: 2 },
        },
      ],
    },
    {
      id: 'supper',
      name: 'Ceia',
      time: '22:15',
      targetMacros: { calories: 210, protein: 18, carbs: 12, fat: 8 },
      items: [
        {
          id: 'supper-1',
          label: 'Iogurte proteico com chia',
          qty: '1 unidade + 10g',
          macros: { calories: 160, protein: 16, carbs: 8, fat: 5 },
        },
        {
          id: 'supper-2',
          label: 'Kiwi',
          qty: '1 unidade',
          macros: { calories: 50, protein: 2, carbs: 4, fat: 3 },
        },
      ],
    },
  ]
}

function createMealsWithStatuses(statuses: Array<Meal['status']>): Meal[] {
  const blueprints = createMealBlueprints()

  return blueprints.map((blueprint, index) => ({
    ...blueprint,
    status: statuses[index] ?? 'pending',
    completedAt: statuses[index] === 'done' ? nowIso() : undefined,
    note: '',
  }))
}

function createDay(
  date: string,
  statuses: Array<Meal['status']>,
  waterEntries: Array<{ ml: number }>,
  waterGoalMl: number,
  starsEarned = 12,
): NutritionDay {
  const goals = {
    calories: 2200,
    protein: 130,
    carbs: 250,
    fat: 70,
    waterMl: waterGoalMl,
  }

  const day: NutritionDay = {
    date,
    goals,
    consumed: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      waterMl: 0,
    },
    meals: createMealsWithStatuses(statuses),
    starsEarned,
    waterLog: {
      entries: waterEntries.map((entry, index) => ({
        id: `${date}-water-${index + 1}`,
        ml: entry.ml,
        at: nowIso(),
      })),
    },
  }

  return recalculateDay(day)
}

export function createNutritionMockDays(todayDate: string, waterGoalMl = 2500): NutritionDaysMap {
  const map: NutritionDaysMap = {}

  map[todayDate] = createDay(
    todayDate,
    ['done', 'pending', 'pending', 'pending', 'pending'],
    [{ ml: 300 }, { ml: 300 }, { ml: 500 }, { ml: 300 }],
    waterGoalMl,
    15,
  )
  map[addDays(todayDate, -1)] = createDay(
    addDays(todayDate, -1),
    ['done', 'done', 'done', 'done', 'done'],
    [{ ml: 500 }, { ml: 500 }, { ml: 500 }, { ml: 500 }, { ml: 500 }],
    waterGoalMl,
    18,
  )
  map[addDays(todayDate, 1)] = createDay(
    addDays(todayDate, 1),
    ['pending', 'pending', 'pending', 'pending', 'pending'],
    [],
    waterGoalMl,
    12,
  )
  map[addDays(todayDate, -2)] = createDay(
    addDays(todayDate, -2),
    ['done', 'done', 'pending', 'done', 'pending'],
    [{ ml: 500 }, { ml: 300 }, { ml: 300 }],
    waterGoalMl,
    10,
  )
  map[addDays(todayDate, -3)] = createDay(
    addDays(todayDate, -3),
    ['done', 'done', 'done', 'pending', 'pending'],
    [{ ml: 500 }, { ml: 500 }, { ml: 300 }],
    waterGoalMl,
    11,
  )
  map[addDays(todayDate, -4)] = createDay(
    addDays(todayDate, -4),
    ['done', 'pending', 'pending', 'pending', 'skipped'],
    [{ ml: 300 }, { ml: 300 }],
    waterGoalMl,
    6,
  )
  map[addDays(todayDate, -5)] = createDay(
    addDays(todayDate, -5),
    ['done', 'done', 'done', 'pending', 'done'],
    [{ ml: 500 }, { ml: 500 }, { ml: 500 }],
    waterGoalMl,
    13,
  )
  map[addDays(todayDate, -6)] = createDay(
    addDays(todayDate, -6),
    ['pending', 'pending', 'pending', 'pending', 'pending'],
    [{ ml: 300 }],
    waterGoalMl,
    4,
  )

  return map
}
