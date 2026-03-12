import { getStudentDataSourcePreference, isFirebaseConfigured } from '@/shared/services/firebase'

import type { StudentRepository } from './studentRepository'
import { studentFirebaseRepository } from './studentFirebaseRepository'
import { studentMockRepository } from './studentMockRepository'

let cachedRepository: StudentRepository | null = null

export function getStudentRepository(): StudentRepository {
  if (cachedRepository) {
    return cachedRepository
  }

  const prefersFirebase = getStudentDataSourcePreference() === 'firebase'
  cachedRepository = prefersFirebase && isFirebaseConfigured() ? studentFirebaseRepository : studentMockRepository
  return cachedRepository
}
