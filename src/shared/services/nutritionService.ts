import { httpClient } from '@/shared/services/http'
import { nutritionMockRepository } from '@/shared/services/repositories/nutritionMockRepository'
import type { Meal, NutritionDay, NutritionDaysMap, NutritionDaysPayload, NutritionPermissions } from '@/shared/services/contracts/nutrition'

const defaultPermissions: NutritionPermissions = {
  hasActiveNutritionist: false,
  canEditPlan: true,
  canRegisterConsumption: true,
}

export const nutritionService = {
  getDaysSnapshot(anchorDate: string) {
    return nutritionMockRepository.getDaysSnapshot(anchorDate)
  },
  saveDaysSnapshot(days: NutritionDaysMap) {
    nutritionMockRepository.saveDaysSnapshot(days)
  },
  async fetchDays(anchorDate: string): Promise<NutritionDaysPayload> {
    const response = await httpClient.get<NutritionDaysPayload>('/nutrition/days', {
      query: { anchorDate },
    })

    return {
      daysByDate: response.daysByDate,
      permissions: response.permissions ?? defaultPermissions,
    }
  },
  async updateMealStatus(params: { date: string; mealId: string; status: Meal['status'] }): Promise<NutritionDay> {
    return httpClient.patch<NutritionDay, { date: string; mealId: string; status: Meal['status'] }>('/nutrition/meals/status', params)
  },
  async updateMeal(params: { date: string; mealId: string; patch: Partial<Pick<Meal, 'name' | 'time' | 'note'>> }): Promise<NutritionDay> {
    return httpClient.patch<NutritionDay, { date: string; mealId: string; patch: Partial<Pick<Meal, 'name' | 'time' | 'note'>> }>(
      '/nutrition/meals/update',
      params,
    )
  },
  async deleteMeal(params: { date: string; mealId: string }): Promise<NutritionDay> {
    return httpClient.post<NutritionDay, { date: string; mealId: string }>('/nutrition/meals/delete', params)
  },
  async addWaterEntry(params: { date: string; ml: number }): Promise<NutritionDay> {
    return httpClient.post<NutritionDay, { date: string; ml: number }>('/nutrition/water', params)
  },
  async removeLastWaterEntry(params: { date: string }): Promise<NutritionDay> {
    return httpClient.post<NutritionDay, { date: string }>('/nutrition/water/remove-last', params)
  },
  async updateWaterGoal(params: { date: string; waterMl: number }): Promise<NutritionDay> {
    return httpClient.patch<NutritionDay, { date: string; waterMl: number }>('/nutrition/goals/water', params)
  },
}
