import type { BodyMeasurements, ProgressOverview, ProgressRange } from '@/shared/services/contracts/progress'
import type { StudentRepositorySource } from '@/shared/services/contracts/student'

export interface ProgressRepository {
  readonly source: StudentRepositorySource
  getOverview(range: ProgressRange): Promise<ProgressOverview>
  registerWeight(params: { weightKg: number; date?: string }): Promise<{ saved: boolean }>
  registerBodyMeasurements(params: {
    measurements: BodyMeasurements
    date?: string
    comment?: string
  }): Promise<{ saved: boolean }>
  requestMeasurementsUpdate(params?: { note?: string }): Promise<{ sent: boolean }>
}
