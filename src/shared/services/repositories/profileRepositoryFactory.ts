import type { ProfileRepository } from './profileRepository'
import { profileFirebaseRepository } from './profileFirebaseRepository'

export function getProfileRepository(): ProfileRepository {
  return profileFirebaseRepository
}
