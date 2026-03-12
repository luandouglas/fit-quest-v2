import { httpClient } from '@/shared/services/http'
import type { BodyMeasurements, ProgressOverview, ProgressRange } from '@/shared/services/contracts/progress'

import type { ProgressRepository } from './progressRepository'

export const progressMockRepository: ProgressRepository = {
  source: 'mock',
  async getOverview(range: ProgressRange): Promise<ProgressOverview> {
    return httpClient.get<ProgressOverview>('/progress/overview', {
      query: { range },
    })
  },
  async registerWeight(params: { weightKg: number; date?: string }): Promise<{ saved: boolean }> {
    return httpClient.post<{ saved: boolean }, { weightKg: number; date?: string }>('/progress/weight', params)
  },
  async registerBodyMeasurements(params: {
    measurements: BodyMeasurements
    date?: string
    comment?: string
  }): Promise<{ saved: boolean }> {
    return httpClient.post<
      { saved: boolean },
      { measurements: BodyMeasurements; date?: string; comment?: string }
    >('/progress/measurements', params)
  },
  async requestMeasurementsUpdate(params?: { note?: string }): Promise<{ sent: boolean }> {
    return httpClient.post<{ sent: boolean }, { note?: string }>('/progress/measurements/request-update', params)
  },
}
