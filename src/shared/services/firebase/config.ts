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

export function getAuthProviderPreference() {
  const requested = cleanEnvValue(import.meta.env.VITE_AUTH_PROVIDER)

  if (requested === 'mock') {
    return 'mock' as const
  }

  if (requested === 'firebase') {
    return 'firebase' as const
  }

  if (import.meta.env.MODE === 'test') {
    return 'mock' as const
  }

  return isFirebaseConfigured() ? ('firebase' as const) : ('mock' as const)
}

export function getStudentDataSourcePreference() {
  const requested = cleanEnvValue(import.meta.env.VITE_STUDENT_DATA_SOURCE)

  if (requested === 'firebase') {
    return 'firebase' as const
  }

  return 'mock' as const
}
