import { browserLocalPersistence, getAuth, initializeAuth, type Auth } from 'firebase/auth'
import { Capacitor } from '@capacitor/core'

import { getFirebaseApp } from './app'

let _auth: Auth | null = null

export function getFirebaseAuth(): Auth | null {
  if (_auth) {
    return _auth
  }

  const app = getFirebaseApp()

  if (!app) {
    return null
  }

  if (Capacitor.isNativePlatform()) {
    _auth = initializeAuth(app, {
      persistence: browserLocalPersistence,
    })
  } else {
    _auth = getAuth(app)
  }

  return _auth
}
