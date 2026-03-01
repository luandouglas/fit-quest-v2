import { httpClient } from '@/shared/services/http'
import { nutritionMockRepository } from '@/shared/services/repositories/nutritionMockRepository'
import type { Meal, NutritionDay, NutritionDaysMap } from '@/shared/services/contracts/nutrition'

type NutritionDaysResponse = {
  daysByDate: NutritionDaysMap
}

export const nutritionService = {
  getDaysSnapshot(anchorDate: string) {
    return nutritionMockRepository.getDaysSnapshot(anchorDate)
  },
  saveDaysSnapshot(days: NutritionDaysMap) {
    nutritionMockRepository.saveDaysSnapshot(days)
  },
  async fetchDays(anchorDate: string): Promise<NutritionDaysMap> {
    const response = await httpClient.get<NutritionDaysResponse>('/nutrition/days', {
      query: { anchorDate },
    })

    return response.daysByDate
  },
  async updateMealStatus(params: { date: string; mealId: string; status: Meal['status'] }): Promise<NutritionDay> {
    return httpClient.patch<NutritionDay, { date: string; mealId: string; status: Meal['status'] }>('/nutrition/meals/status', params)
  },
  async addWaterEntry(params: { date: string; ml: number }): Promise<NutritionDay> {
    return httpClient.post<NutritionDay, { date: string; ml: number }>('/nutrition/water', params)
  },
}
