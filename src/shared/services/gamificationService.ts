import { httpClient } from '@/shared/services/http'
import type { GamificationOverview } from '@/shared/services/contracts/gamification'

export const gamificationService = {
  async getOverview(): Promise<GamificationOverview> {
    return httpClient.get<GamificationOverview>('/gamification/overview')
  },
}
