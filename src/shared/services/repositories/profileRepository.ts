import type { ProfileSettings, UpdateProfilePayload } from '@/shared/services/contracts/profile'
import type { StudentRepositorySource } from '@/shared/services/contracts/student'

export interface ProfileRepository {
  readonly source: StudentRepositorySource
  getProfile(): Promise<ProfileSettings>
  updateProfile(payload: UpdateProfilePayload): Promise<ProfileSettings>
}
