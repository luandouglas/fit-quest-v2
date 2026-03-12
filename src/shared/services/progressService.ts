import type { BodyMeasurements, ProgressOverview, ProgressRange } from '@/shared/services/contracts/progress'
import { getProgressRepository } from '@/shared/services/repositories/progressRepositoryFactory'

export const progressService = {
  async getOverview(range: ProgressRange = '7d'): Promise<ProgressOverview> {
    return getProgressRepository().getOverview(range)
  },
  async registerWeight(params: { weightKg: number; date?: string }): Promise<{ saved: boolean }> {
    return getProgressRepository().registerWeight(params)
  },
  async registerBodyMeasurements(params: { measurements: BodyMeasurements; date?: string; comment?: string }): Promise<{ saved: boolean }> {
    return getProgressRepository().registerBodyMeasurements(params)
  },
  async requestMeasurementsUpdate(params?: { note?: string }): Promise<{ sent: boolean }> {
    return getProgressRepository().requestMeasurementsUpdate(params)
  },
}
