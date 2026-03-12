import { getStudentDataSourcePreference, isFirebaseConfigured } from '@/shared/services/firebase'

import type { ProgressRepository } from './progressRepository'
import { progressFirebaseRepository } from './progressFirebaseRepository'
import { progressMockRepository } from './progressMockRepository'

let cachedRepository: ProgressRepository | null = null

export function getProgressRepository(): ProgressRepository {
  if (cachedRepository) {
    return cachedRepository
  }

  const prefersFirebase = getStudentDataSourcePreference() === 'firebase'
  cachedRepository = prefersFirebase && isFirebaseConfigured() ? progressFirebaseRepository : progressMockRepository
  return cachedRepository
}
