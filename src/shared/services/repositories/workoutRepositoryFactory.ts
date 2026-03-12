import { getStudentDataSourcePreference, isFirebaseConfigured } from '@/shared/services/firebase'

import type { WorkoutRepository } from './workoutRepository'
import { workoutFirebaseRepository } from './workoutFirebaseRepository'
import { workoutMockRepositoryAdapter } from './workoutMockRepositoryAdapter'

let cachedRepository: WorkoutRepository | null = null

export function getWorkoutRepository(): WorkoutRepository {
  if (cachedRepository) {
    return cachedRepository
  }

  const prefersFirebase = getStudentDataSourcePreference() === 'firebase'
  cachedRepository = prefersFirebase && isFirebaseConfigured() ? workoutFirebaseRepository : workoutMockRepositoryAdapter
  return cachedRepository
}
