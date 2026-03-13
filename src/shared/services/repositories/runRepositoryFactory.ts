import type { RunRepository } from './runRepository'
import { runFirebaseRepository } from './runFirebaseRepository'

export function getRunRepository(): RunRepository {
  return runFirebaseRepository
}
