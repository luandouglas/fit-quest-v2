import type { ProgressRepository } from './progressRepository'
import { progressFirebaseRepository } from './progressFirebaseRepository'

export function getProgressRepository(): ProgressRepository {
  return progressFirebaseRepository
}
