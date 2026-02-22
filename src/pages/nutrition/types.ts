export type MacroGoals = {
  calories: number
  protein: number
  carbs: number
  fat: number
}

export type DailyGoals = MacroGoals & {
  waterMl: number
}

export type DailyConsumed = MacroGoals & {
  waterMl: number
}

export type MealItem = {
  id: string
  label: string
  qty?: string
  macros?: MacroGoals
}

export type MealStatus = 'pending' | 'done' | 'skipped'

export type Meal = {
  id: string
  name: string
  time: string
  status: MealStatus
  targetMacros: MacroGoals
  items: MealItem[]
  completedAt?: string
}

export type NutritionDay = {
  date: string
  goals: DailyGoals
  consumed: DailyConsumed
  meals: Meal[]
  notes?: string
  starsEarned?: number
}

export type WaterLogEntry = {
  id: string
  ml: number
  at: string
}

export type WaterLog = {
  entries: WaterLogEntry[]
}

export type NutritionUiState = 'loading' | 'ready' | 'empty' | 'error'
