import { getStudentDataSourcePreference, isFirebaseConfigured } from '@/shared/services/firebase'

import type { RunRepository } from './runRepository'
import { runFirebaseRepository } from './runFirebaseRepository'
import { runMockRepositoryAdapter } from './runMockRepositoryAdapter'

let cachedRepository: RunRepository | null = null

export function getRunRepository(): RunRepository {
  if (cachedRepository) {
    return cachedRepository
  }

  const prefersFirebase = getStudentDataSourcePreference() === 'firebase'
  cachedRepository = prefersFirebase && isFirebaseConfigured() ? runFirebaseRepository : runMockRepositoryAdapter
  return cachedRepository
}
