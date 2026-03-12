import type { GamificationOverview } from '@/shared/services/contracts/gamification'
import { getGamificationRepository } from '@/shared/services/repositories/gamificationRepositoryFactory'

export const gamificationService = {
  async getOverview(): Promise<GamificationOverview> {
    return getGamificationRepository().getOverview()
  },
}
