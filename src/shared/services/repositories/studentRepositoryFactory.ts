import type { StudentRepository } from './studentRepository'
import { studentFirebaseRepository } from './studentFirebaseRepository'

export function getStudentRepository(): StudentRepository {
  return studentFirebaseRepository
}
