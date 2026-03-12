import { httpClient } from '@/shared/services/http'
import type { GamificationOverview } from '@/shared/services/contracts/gamification'

import type { GamificationRepository } from './gamificationRepository'

export const gamificationMockRepository: GamificationRepository = {
  source: 'mock',
  async getOverview(): Promise<GamificationOverview> {
    return httpClient.get<GamificationOverview>('/gamification/overview')
  },
}
