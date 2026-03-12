import { httpClient } from '@/shared/services/http'
import type { ProfileSettings, UpdateProfilePayload } from '@/shared/services/contracts/profile'

import type { ProfileRepository } from './profileRepository'

export const profileMockRepository: ProfileRepository = {
  source: 'mock',
  async getProfile(): Promise<ProfileSettings> {
    return httpClient.get<ProfileSettings>('/profile')
  },
  async updateProfile(payload: UpdateProfilePayload): Promise<ProfileSettings> {
    return httpClient.patch<ProfileSettings, { patch: UpdateProfilePayload }>('/profile', {
      patch: payload,
    })
  },
}
