import type {
  Meal,
  NutritionDay,
  NutritionDaysMap,
  NutritionDaysPayload,
  NutritionPermissions,
} from '@/shared/services/contracts/nutrition'

import { getNutritionRepository } from '@/shared/services/repositories/nutritionRepositoryFactory'

const defaultPermissions: NutritionPermissions = {
  hasActiveNutritionist: true,
  canEditPlan: false,
  canRegisterConsumption: true,
  canAddMealNotes: true,
  canUpdateWater: true,
}

export const nutritionService = {
  getDaysSnapshot(anchorDate: string) {
    return getNutritionRepository().getDaysSnapshot(anchorDate)
  },
  saveDaysSnapshot(days: NutritionDaysMap) {
    getNutritionRepository().saveDaysSnapshot(days)
  },
  async fetchDays(anchorDate: string): Promise<NutritionDaysPayload> {
    const response = await getNutritionRepository().getDays(anchorDate)

    return {
      daysByDate: response.daysByDate,
      permissions: response.permissions ?? defaultPermissions,
    }
  },
  async updateMealStatus(params: { date: string; mealId: string; status: Meal['status'] }): Promise<NutritionDay> {
    return getNutritionRepository().updateMealStatus(params)
  },
  async updateMeal(params: { date: string; mealId: string; patch: Partial<Pick<Meal, 'name' | 'time' | 'note'>> }): Promise<NutritionDay> {
    return getNutritionRepository().updateMealNote({
      date: params.date,
      mealId: params.mealId,
      note: params.patch.note ?? '',
    })
  },
  async deleteMeal(): Promise<NutritionDay> {
    throw new Error('Student nutrition flow does not support deleting meals.')
  },
  async addWaterEntry(params: { date: string; ml: number }): Promise<NutritionDay> {
    return getNutritionRepository().addWaterEntry(params)
  },
  async removeLastWaterEntry(params: { date: string }): Promise<NutritionDay> {
    return getNutritionRepository().removeLastWaterEntry(params)
  },
  async updateWaterGoal(params: { date: string; waterMl: number }): Promise<NutritionDay> {
    return getNutritionRepository().updateWaterGoal(params)
  },
}
