import type { AuthCredentials, AuthRegistrationInput, AuthSession } from '@/shared/types'
import { getAuthProviderPreference, isFirebaseConfigured } from '@/shared/services/firebase'

import { firebaseAuthRepository } from './firebaseAuthRepository'
import { mockAuthRepository } from './mockAuthRepository'

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
  updateStoredSessionUser: (patch: Partial<AuthSession['user']>) => AuthSession | null
  subscribeToSession?: (listener: AuthSessionListener) => () => void
}

let cachedRepository: AuthRepository | null = null

export function getAuthRepository() {
  if (cachedRepository) {
    return cachedRepository
  }

  const prefersFirebase = getAuthProviderPreference() === 'firebase'
  cachedRepository = prefersFirebase && isFirebaseConfigured() ? firebaseAuthRepository : mockAuthRepository

  return cachedRepository
}
