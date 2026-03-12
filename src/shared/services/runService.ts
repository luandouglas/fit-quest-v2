import type { RunOverview, RunRankingSnapshot, RunSession, StartRunInput } from '@/shared/services/contracts/run'
import { getRunRepository } from '@/shared/services/repositories/runRepositoryFactory'

export const runService = {
  async getOverview(): Promise<RunOverview> {
    return getRunRepository().getOverview()
  },
  async getLastCompletedSession(): Promise<RunSession | null> {
    return getRunRepository().getLastCompletedSession()
  },
  async startRun(input?: StartRunInput): Promise<RunSession> {
    return getRunRepository().startRun(input)
  },
  async updateRunProgress(session: RunSession): Promise<RunSession> {
    return getRunRepository().updateRunProgress(session)
  },
  async finishRun(session: RunSession): Promise<RunSession> {
    return getRunRepository().finishRun(session)
  },
  async getRankingSnapshot(): Promise<RunRankingSnapshot> {
    return getRunRepository().getRankingSnapshot()
  },
}
