import type { GamificationOverview } from '@/shared/services/contracts/gamification'
import type { StudentRepositorySource } from '@/shared/services/contracts/student'

export interface GamificationRepository {
  readonly source: StudentRepositorySource
  getOverview(): Promise<GamificationOverview>
}
