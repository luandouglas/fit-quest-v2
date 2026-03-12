import { httpClient } from '@/shared/services/http'
import { nutritionService } from '@/shared/services/nutritionService'
import { profileService } from '@/shared/services/profileService'
import type { NutritionDay } from '@/shared/services/contracts/nutrition'
import type { ProfilePreferences } from '@/shared/services/contracts/profile'
import type {
  CardioSession,
  DailyProgress,
  GamificationProfile,
  NutritionDayPlan,
  RankingSummary,
  StudentDashboard,
  StudentMealStatusInput,
  StudentProfile,
  StudentProfilePreferencesPatch,
  StudentRepositorySource,
  StudentWaterIntakeInput,
  StudentWorkoutExecutionInput,
  WaterProgress,
  WorkoutDay,
} from '@/shared/services/contracts/student'

import type { StudentDashboardQuery, StudentRepository } from './studentRepository'

function toIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getNutritionPlanStatus(day: NutritionDay): NutritionDayPlan['status'] {
  const completedMeals = day.meals.filter((meal) => meal.status === 'done').length
  const skippedMeals = day.meals.filter((meal) => meal.status === 'skipped').length
  const pendingMeals = day.meals.filter((meal) => meal.status === 'pending').length
  const totalMeals = day.meals.length

  if (totalMeals > 0 && completedMeals === totalMeals) {
    return 'completed'
  }

  if (pendingMeals === 0 && skippedMeals > 0) {
    return 'partial'
  }

  if (completedMeals > 0 || skippedMeals > 0 || day.consumed.waterMl > 0) {
    return 'in_progress'
  }

  return 'planned'
}

function toNutritionPlan(day: NutritionDay): NutritionDayPlan {
  const completedMeals = day.meals.filter((meal) => meal.status === 'done').length
  const totalMeals = Math.max(day.meals.length, 1)
  const adherencePct = Math.round((completedMeals / totalMeals) * 100)

  return {
    date: day.date,
    status: getNutritionPlanStatus(day),
    adherencePct,
    caloriesTarget: day.goals.calories,
    caloriesConsumed: day.consumed.calories,
    proteinTargetG: day.goals.protein,
    proteinConsumedG: day.consumed.protein,
    carbsTargetG: day.goals.carbs,
    carbsConsumedG: day.consumed.carbs,
    fatTargetG: day.goals.fat,
    fatConsumedG: day.consumed.fat,
    meals: day.meals.map((meal) => ({
      id: meal.id,
      name: meal.name,
      scheduledAt: meal.time,
      status: meal.status === 'done' ? 'completed' : meal.status,
      itemsSummary: meal.items.map((item) => item.label).join(', '),
      targetCalories: meal.targetMacros.calories,
      consumedCalories: meal.status === 'done' ? meal.targetMacros.calories : 0,
      rewardStars: meal.status === 'done' ? 3 : 0,
    })),
  }
}

function toWaterProgress(day: NutritionDay): WaterProgress {
  const completionPct = Math.round((day.consumed.waterMl / Math.max(day.goals.waterMl, 1)) * 100)
  const checkpointsTotal = Math.ceil(day.goals.waterMl / 500)
  const checkpointsCompleted = Math.min(Math.floor(day.consumed.waterMl / 500), checkpointsTotal)

  return {
    status: completionPct >= 100 ? 'completed' : completionPct > 0 ? 'in_progress' : 'empty',
    consumedMl: day.consumed.waterMl,
    targetMl: day.goals.waterMl,
    remainingMl: Math.max(day.goals.waterMl - day.consumed.waterMl, 0),
    completionPct: Math.min(completionPct, 100),
    checkpointsCompleted,
    checkpointsTotal,
  }
}

export const studentMockRepository: StudentRepository = {
  source: 'mock' satisfies StudentRepositorySource,
  async getDashboard({ date }: StudentDashboardQuery): Promise<StudentDashboard> {
    return httpClient.get<StudentDashboard>('/student/dashboard', {
      query: { date },
    })
  },
  async getProfile(): Promise<StudentProfile> {
    const dashboard = await this.getDashboard({ date: toIsoDate(new Date()) })
    return dashboard.profile
  },
  async getDailyProgress(date: string): Promise<DailyProgress> {
    const dashboard = await this.getDashboard({ date })
    return dashboard.dailyProgress
  },
  async getWorkoutDay(date: string): Promise<WorkoutDay | null> {
    const dashboard = await this.getDashboard({ date })
    return dashboard.todayWorkout
  },
  async getCardioSession(date: string): Promise<CardioSession | null> {
    const dashboard = await this.getDashboard({ date })
    return dashboard.cardioSession
  },
  async saveWorkoutExecution(input: StudentWorkoutExecutionInput): Promise<void> {
    await httpClient.post('/student/workouts/execution', input)
  },
  async getNutritionDayPlan(date: string): Promise<NutritionDayPlan> {
    const dashboard = await this.getDashboard({ date })
    return dashboard.nutritionPlan
  },
  async saveMealStatus(input: StudentMealStatusInput): Promise<NutritionDayPlan> {
    const day = await nutritionService.updateMealStatus({
      date: input.date,
      mealId: input.mealId,
      status: input.status === 'completed' ? 'done' : input.status,
    })

    return toNutritionPlan(day)
  },
  async saveWaterIntake(input: StudentWaterIntakeInput) {
    const day = await nutritionService.addWaterEntry({
      date: input.date,
      ml: input.amountMl,
    })

    return {
      nutritionPlan: toNutritionPlan(day),
      waterProgress: toWaterProgress(day),
    }
  },
  async getGamificationProfile(): Promise<GamificationProfile> {
    const dashboard = await this.getDashboard({ date: toIsoDate(new Date()) })
    return dashboard.gamificationProfile
  },
  async getMetrics(): Promise<StudentDashboard['metrics']> {
    const dashboard = await this.getDashboard({ date: toIsoDate(new Date()) })
    return dashboard.metrics
  },
  async getRankingSummary(): Promise<RankingSummary> {
    const dashboard = await this.getDashboard({ date: toIsoDate(new Date()) })
    return dashboard.rankingSummary
  },
  async getProfilePreferences(): Promise<ProfilePreferences> {
    const profile = await profileService.getProfile()
    return profile.preferences
  },
  async saveProfilePreferences(patch: StudentProfilePreferencesPatch): Promise<ProfilePreferences> {
    const profile = await profileService.updateProfile({
      preferences: patch,
    })
    return profile.preferences
  },
}
