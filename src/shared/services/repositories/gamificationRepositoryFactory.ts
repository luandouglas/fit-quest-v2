import type { GamificationRepository } from './gamificationRepository'
import { gamificationFirebaseRepository } from './gamificationFirebaseRepository'

export function getGamificationRepository(): GamificationRepository {
  return gamificationFirebaseRepository
}
