import { getAuth, type Auth } from 'firebase/auth'

import { getFirebaseApp } from './app'

export function getFirebaseAuth(): Auth | null {
  const app = getFirebaseApp()

  if (!app) {
    return null
  }

  return getAuth(app)
}
