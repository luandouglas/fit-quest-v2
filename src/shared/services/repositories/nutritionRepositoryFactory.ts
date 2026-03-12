import { getStudentDataSourcePreference, isFirebaseConfigured } from '@/shared/services/firebase'

import type { NutritionRepository } from './nutritionRepository'
import { nutritionFirebaseRepository } from './nutritionFirebaseRepository'
import { nutritionMockRepositoryAdapter } from './nutritionMockRepositoryAdapter'

let cachedRepository: NutritionRepository | null = null

export function getNutritionRepository(): NutritionRepository {
  if (cachedRepository) {
    return cachedRepository
  }

  const prefersFirebase = getStudentDataSourcePreference() === 'firebase'
  cachedRepository = prefersFirebase && isFirebaseConfigured() ? nutritionFirebaseRepository : nutritionMockRepositoryAdapter
  return cachedRepository
}
