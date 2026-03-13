export type FirebaseWebConfig = {
  apiKey: string
  authDomain?: string
  projectId: string
  storageBucket?: string
  messagingSenderId?: string
  appId: string
  measurementId?: string
}

function cleanEnvValue(value: string | undefined) {
  return value && value.trim().length > 0 ? value.trim() : undefined
}

export function getFirebaseWebConfig(): FirebaseWebConfig | null {
  const apiKey = cleanEnvValue(import.meta.env.VITE_FIREBASE_API_KEY)
  const projectId = cleanEnvValue(import.meta.env.VITE_FIREBASE_PROJECT_ID)
  const appId = cleanEnvValue(import.meta.env.VITE_FIREBASE_APP_ID)

  if (!apiKey || !projectId || !appId) {
    return null
  }

  return {
    apiKey,
    projectId,
    appId,
    authDomain: cleanEnvValue(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
    storageBucket: cleanEnvValue(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
    messagingSenderId: cleanEnvValue(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
    measurementId: cleanEnvValue(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID),
  }
}

export function isFirebaseConfigured() {
  return getFirebaseWebConfig() !== null
}


