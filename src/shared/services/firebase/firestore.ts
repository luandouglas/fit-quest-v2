import { getFirestore, type Firestore } from 'firebase/firestore/lite'

import { getFirebaseApp } from './app'

export function getFirebaseFirestore(): Firestore | null {
  const app = getFirebaseApp()

  if (!app) {
    return null
  }

  return getFirestore(app)
}
