export type Macros = {
  calories: number
  protein: number
  carbs: number
  fat: number
}

export type MealItem = {
  id: string
  label: string
  qty?: string
  macros?: Macros
}

export type Meal = {
  id: string
  name: string
  time: string
  status: 'pending' | 'done' | 'skipped'
  targetMacros: Macros
  items: MealItem[]
  completedAt?: string
  note?: string
}

export type WaterLogEntry = {
  id: string
  ml: number
  at: string
}

export type WaterLog = {
  entries: WaterLogEntry[]
}

export type NutritionDay = {
  date: string
  goals: Macros & { waterMl: number }
  consumed: Macros & { waterMl: number }
  meals: Meal[]
  notes?: string
  starsEarned?: number
  waterLog: WaterLog
}

export type NutritionHistoryDay = {
  date: string
  mealsDonePct: number
  calories: number
  waterMl: number
  status: 'ok' | 'pending'
}

export type NutritionDaysMap = Record<string, NutritionDay>
