import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app'

import { getFirebaseWebConfig } from './config'

export function getFirebaseApp(): FirebaseApp | null {
  const config = getFirebaseWebConfig()

  if (!config) {
    return null
  }

  if (getApps().length > 0) {
    return getApp()
  }

  return initializeApp(config)
}
