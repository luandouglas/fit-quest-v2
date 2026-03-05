import { httpClient } from '@/shared/services/http'
import type { RunOverview, RunRankingSnapshot, RunSession } from '@/shared/services/contracts/run'

export const runService = {
  async getOverview(): Promise<RunOverview> {
    return httpClient.get<RunOverview>('/run/overview')
  },
  async startRun(): Promise<RunSession> {
    return httpClient.post<RunSession>('/run/start')
  },
  async updateRunProgress(session: RunSession): Promise<RunSession> {
    return httpClient.patch<RunSession, { session: RunSession }>('/run/progress', { session })
  },
  async finishRun(session: RunSession): Promise<RunSession> {
    return httpClient.post<RunSession, { session: RunSession }>('/run/finish', { session })
  },
  async getRankingSnapshot(): Promise<RunRankingSnapshot> {
    return httpClient.get<RunRankingSnapshot>('/run/ranking')
  },
}
