import type { RunOverview, RunRankingSnapshot, RunSession, StartRunInput } from '@/shared/services/contracts/run'
import type { StudentRepositorySource } from '@/shared/services/contracts/student'

export interface RunRepository {
  readonly source: StudentRepositorySource
  getOverview(): Promise<RunOverview>
  getRankingSnapshot(): Promise<RunRankingSnapshot>
  getLastCompletedSession(): Promise<RunSession | null>
  startRun(input?: StartRunInput): Promise<RunSession>
  updateRunProgress(session: RunSession): Promise<RunSession>
  finishRun(session: RunSession): Promise<RunSession>
}
