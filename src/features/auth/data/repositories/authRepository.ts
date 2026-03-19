import type { AuthCredentials, AuthRegistrationInput, AuthSession } from '@/shared/types'
import { firebaseAuthRepository } from './firebaseAuthRepository'

export type AuthSessionListener = (session: AuthSession | null) => void

export type AuthRepository = {
  mode: 'firebase' | 'mock'
  shouldHydrateSession: boolean
  clearSession: () => void
  getStoredSession: () => AuthSession | null
  login: (credentials: AuthCredentials) => Promise<AuthSession>
  logout: () => Promise<void>
  persistSession: (session: AuthSession) => void
  register: (input: AuthRegistrationInput) => Promise<AuthSession>
  requestPasswordReset: (email: string) => Promise<void>
  updateStoredSessionUser: (patch: Partial<AuthSession['user']>) => AuthSession | null
  subscribeToSession?: (listener: AuthSessionListener) => () => void
}

export function getAuthRepository(): AuthRepository {
  return firebaseAuthRepository
}
