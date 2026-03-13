import type { WorkoutRepository } from './workoutRepository'
import { workoutFirebaseRepository } from './workoutFirebaseRepository'

export function getWorkoutRepository(): WorkoutRepository {
  return workoutFirebaseRepository
}
