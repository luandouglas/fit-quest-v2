import { httpClient } from '@/shared/services/http'
import type { HomeDashboardOverview } from '@/shared/services/contracts/home'

export const homeService = {
  async getDashboardOverview(): Promise<HomeDashboardOverview> {
    return httpClient.get<HomeDashboardOverview>('/home/dashboard')
  },
  async registerMealQuick(): Promise<{ mealId: string | null }> {
    return httpClient.post<{ mealId: string | null }>('/home/actions/register-meal')
  },
  async registerWaterQuick(ml = 250): Promise<{ totalWaterMl: number }> {
    return httpClient.post<{ totalWaterMl: number }, { ml: number }>('/home/actions/register-water', { ml })
  },
}
