import type { MeasurementsUpdateRequest } from '@/shared/services/contracts/requests'

export type NutritionistStudent = {
  id: string
  name: string
  email: string
  activeDietTitle: string | null
  mealsPerDay: number
  caloriesTarget: number
}

export type NutritionistDietMealInput = {
  name: string
  time: string
  calories: number
  protein: number
  carbs: number
  fat: number
  note?: string
}

export type CreateNutritionistDietInput = {
  studentId: string
  title: string
  dailyCalories: number
  macroDistribution: {
    proteinPct: number
    carbsPct: number
    fatPct: number
  }
  meals: NutritionistDietMealInput[]
}

export type NutritionistAssignedDiet = {
  id: string
  studentId: string
  studentName: string
  title: string
  dailyCalories: number
  macroDistribution: {
    proteinPct: number
    carbsPct: number
    fatPct: number
  }
  mealsCount: number
  isActive: boolean
  createdAt: string
}

export type NutritionistAssessment = {
  studentId: string
  studentName: string
  adherencePct7d: number
  avgWaterMl7d: number
  avgCalories7d: number
  calorieTargetDaily: number
  calorieAdherencePct7d: number
  weightCurrentKg: number | null
  weightDeltaKg30d: number | null
  projectedWeightKg: number | null
  projectionDeltaKg: number | null
  alerts: NutritionistAssessmentAlert[]
  lastCheckinAt: string | null
}

export type NutritionistAssessmentAlertType = 'goal-not-hit' | 'weight-off-track'
export type NutritionistAssessmentAlertSeverity = 'warning' | 'danger'

export type NutritionistAssessmentAlert = {
  id: string
  type: NutritionistAssessmentAlertType
  severity: NutritionistAssessmentAlertSeverity
  message: string
}

export type NutritionistDashboardOverview = {
  students: NutritionistStudent[]
  diets: NutritionistAssignedDiet[]
  assessments: NutritionistAssessment[]
  measurementRequests: MeasurementsUpdateRequest[]
}

export type SendNutritionistMotivationInput = {
  studentId: string
  message: string
}

export type GrantNutritionistAchievementInput = {
  studentId: string
  title: string
  description: string
}
