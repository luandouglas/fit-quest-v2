import type { Meal, NutritionDay, WaterLog } from './types'

const DAY_MS = 24 * 60 * 60 * 1000

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

function shiftDate(base: Date, offset: number) {
  return new Date(base.getTime() + offset * DAY_MS)
}

function createMeals(dayOffset: number): Meal[] {
  const postWorkoutPending = dayOffset > 0

  return [
    {
      id: `breakfast-${dayOffset}`,
      name: 'Cafe da manha',
      time: '07:30',
      status: 'done',
      completedAt: '07:42',
      targetMacros: { calories: 520, protein: 34, carbs: 45, fat: 18 },
      items: [
        { id: 'b1', label: 'Omelete 2 ovos + queijo', qty: '2 unidades' },
        { id: 'b2', label: 'Pao integral', qty: '2 fatias' },
        { id: 'b3', label: 'Mamão', qty: '150g' },
      ],
    },
    {
      id: `lunch-${dayOffset}`,
      name: 'Almoco',
      time: '12:30',
      status: dayOffset <= 0 ? 'done' : 'pending',
      completedAt: dayOffset <= 0 ? '12:48' : undefined,
      targetMacros: { calories: 710, protein: 48, carbs: 62, fat: 20 },
      items: [
        { id: 'l1', label: 'Frango grelhado', qty: '180g' },
        { id: 'l2', label: 'Arroz integral', qty: '130g' },
        { id: 'l3', label: 'Brocolis no vapor', qty: '100g' },
      ],
    },
    {
      id: `snack-${dayOffset}`,
      name: 'Lanche',
      time: '16:30',
      status: dayOffset < 0 ? 'done' : 'pending',
      completedAt: dayOffset < 0 ? '16:44' : undefined,
      targetMacros: { calories: 290, protein: 20, carbs: 28, fat: 10 },
      items: [
        { id: 's1', label: 'Iogurte natural', qty: '170g' },
        { id: 's2', label: 'Whey protein', qty: '30g' },
      ],
    },
    {
      id: `dinner-${dayOffset}`,
      name: 'Jantar',
      time: '20:00',
      status: postWorkoutPending ? 'pending' : dayOffset < 0 ? 'done' : 'pending',
      completedAt: dayOffset < 0 ? '20:31' : undefined,
      targetMacros: { calories: 560, protein: 43, carbs: 35, fat: 18 },
      items: [
        { id: 'd1', label: 'Peixe assado', qty: '180g' },
        { id: 'd2', label: 'Batata doce', qty: '150g' },
        { id: 'd3', label: 'Salada verde', qty: '1 prato' },
      ],
    },
  ]
}

function buildConsumed(meals: Meal[], waterMl: number) {
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
        waterMl,
      }
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, waterMl },
  )
}

function buildWaterLog(dayOffset: number) {
  const now = new Date()
  const base = shiftDate(now, dayOffset)
  const date = toIsoDate(base)

  if (dayOffset > 0) {
    return { date, entries: [{ id: `${date}-w1`, ml: 300, at: `${date}T09:30:00` }] }
  }

  if (dayOffset === 0) {
    return {
      date,
      entries: [
        { id: `${date}-w1`, ml: 300, at: `${date}T08:00:00` },
        { id: `${date}-w2`, ml: 200, at: `${date}T10:20:00` },
        { id: `${date}-w3`, ml: 500, at: `${date}T13:40:00` },
      ],
    }
  }

  return {
    date,
    entries: [
      { id: `${date}-w1`, ml: 500, at: `${date}T07:50:00` },
      { id: `${date}-w2`, ml: 300, at: `${date}T11:20:00` },
      { id: `${date}-w3`, ml: 500, at: `${date}T15:20:00` },
      { id: `${date}-w4`, ml: 300, at: `${date}T19:10:00` },
    ],
  }
}

const baseDate = new Date()

const offsets = [-6, -5, -4, -3, -2, -1, 0, 1]

const days = offsets.map((offset) => {
  const date = toIsoDate(shiftDate(baseDate, offset))
  const goals = { calories: 2100, protein: 145, carbs: 190, fat: 66, waterMl: 2600 }
  const meals = createMeals(offset)
  const waterLog = buildWaterLog(offset)
  const consumedWater = waterLog.entries.reduce((sum, entry) => sum + entry.ml, 0)

  return {
    date,
    goals,
    meals,
    consumed: buildConsumed(meals, consumedWater),
    notes: offset === 0 ? 'Priorizar refeicoes do periodo da tarde por causa do treino.' : undefined,
    starsEarned: 0,
  } satisfies NutritionDay
})

export const nutritionMockDataByDate: Record<string, NutritionDay> = days.reduce((acc, day) => {
  acc[day.date] = day
  return acc
}, {} as Record<string, NutritionDay>)

export const nutritionMockWaterLogsByDate: Record<string, WaterLog> = offsets.reduce((acc, offset) => {
  const water = buildWaterLog(offset)
  acc[water.date] = { entries: water.entries }
  return acc
}, {} as Record<string, WaterLog>)

export const initialErroredDates = new Set([toIsoDate(shiftDate(baseDate, -4))])

export function getIsoDateOffset(offset: number) {
  return toIsoDate(shiftDate(baseDate, offset))
}

export function getTodayIsoDate() {
  return toIsoDate(baseDate)
}
