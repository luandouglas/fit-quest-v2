import { getStudentDataSourcePreference, isFirebaseConfigured } from '@/shared/services/firebase'

import type { GamificationRepository } from './gamificationRepository'
import { gamificationFirebaseRepository } from './gamificationFirebaseRepository'
import { gamificationMockRepository } from './gamificationMockRepository'

let cachedRepository: GamificationRepository | null = null

export function getGamificationRepository(): GamificationRepository {
  if (cachedRepository) {
    return cachedRepository
  }

  const prefersFirebase = getStudentDataSourcePreference() === 'firebase'
  cachedRepository = prefersFirebase && isFirebaseConfigured() ? gamificationFirebaseRepository : gamificationMockRepository
  return cachedRepository
}
