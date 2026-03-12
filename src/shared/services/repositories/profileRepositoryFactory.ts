import { getStudentDataSourcePreference, isFirebaseConfigured } from '@/shared/services/firebase'

import type { ProfileRepository } from './profileRepository'
import { profileFirebaseRepository } from './profileFirebaseRepository'
import { profileMockRepository } from './profileMockRepository'

let cachedRepository: ProfileRepository | null = null

export function getProfileRepository(): ProfileRepository {
  if (cachedRepository) {
    return cachedRepository
  }

  const prefersFirebase = getStudentDataSourcePreference() === 'firebase'
  cachedRepository = prefersFirebase && isFirebaseConfigured() ? profileFirebaseRepository : profileMockRepository
  return cachedRepository
}
