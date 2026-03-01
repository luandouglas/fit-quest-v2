import { httpClient } from '@/shared/services/http'
import type { ProgressOverview } from '@/shared/services/contracts/progress'

export const progressService = {
  async getOverview(): Promise<ProgressOverview> {
    return httpClient.get<ProgressOverview>('/progress/overview')
  },
}
