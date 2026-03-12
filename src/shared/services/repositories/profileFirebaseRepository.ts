import { doc, getDoc, setDoc, type DocumentReference } from 'firebase/firestore/lite'

import { authService } from '@/shared/services/authService'
import { getFirebaseFirestore } from '@/shared/services/firebase'
import type { ProfileSettings, ThemePreference, UpdateProfilePayload } from '@/shared/services/contracts/profile'

import type { ProfileRepository } from './profileRepository'

function getDb() {
  const db = getFirebaseFirestore()

  if (!db) {
    throw new Error('Firebase is not configured for profile data.')
  }

  return db
}

function resolveStudentId() {
  const session = authService.getStoredSession()

  if (!session || session.user.role !== 'STUDENT') {
    throw new Error('Authenticated student session is required for profile data.')
  }

  return session.user.id
}

function studentDoc<T>(studentId: string, ...segments: string[]) {
  return doc(getDb(), 'students', studentId, ...segments) as DocumentReference<T>
}

function createDefaultProfileSettings(name?: string): ProfileSettings {
  return {
    name: name?.trim() || 'Atleta FitQuest',
    city: 'Sao Paulo',
    neighborhood: 'Pinheiros',
    gym: 'Iron Temple Pinheiros',
    goal: 'maintenance',
    goals: {
      waterMlDaily: 2500,
      workoutsPerWeek: 5,
    },
    preferences: {
      notificationsEnabled: true,
      remindersEnabled: true,
      measurementSystem: 'metric',
      themePreference: 'system',
    },
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark'
}

function applyProfilePatch(current: ProfileSettings, patch: UpdateProfilePayload): ProfileSettings {
  const nextName = patch.name?.trim() || current.name
  const nextCity = patch.city?.trim() || current.city
  const nextNeighborhood = patch.neighborhood?.trim() || current.neighborhood
  const nextGym = patch.gym?.trim() || current.gym
  const nextGoal = patch.goal ?? current.goal
  const requestedWaterGoal = Number(patch.goals?.waterMlDaily)
  const requestedWorkoutsPerWeek = Number(patch.goals?.workoutsPerWeek)
  const nextWaterGoal = Number.isFinite(requestedWaterGoal)
    ? clamp(Math.round(requestedWaterGoal), 500, 8000)
    : current.goals.waterMlDaily
  const nextWorkoutsPerWeek = Number.isFinite(requestedWorkoutsPerWeek)
    ? clamp(Math.round(requestedWorkoutsPerWeek), 1, 14)
    : current.goals.workoutsPerWeek
  const requestedTheme = patch.preferences?.themePreference
  const nextTheme = isThemePreference(requestedTheme) ? requestedTheme : current.preferences.themePreference
  const nextMeasurementSystem =
    patch.preferences?.measurementSystem === 'imperial' || patch.preferences?.measurementSystem === 'metric'
      ? patch.preferences.measurementSystem
      : current.preferences.measurementSystem

  return {
    ...current,
    name: nextName,
    city: nextCity,
    neighborhood: nextNeighborhood,
    gym: nextGym,
    goal: nextGoal,
    goals: {
      waterMlDaily: nextWaterGoal,
      workoutsPerWeek: nextWorkoutsPerWeek,
    },
    preferences: {
      notificationsEnabled: patch.preferences?.notificationsEnabled ?? current.preferences.notificationsEnabled,
      remindersEnabled: patch.preferences?.remindersEnabled ?? current.preferences.remindersEnabled,
      measurementSystem: nextMeasurementSystem,
      themePreference: nextTheme,
    },
  }
}

export const profileFirebaseRepository: ProfileRepository = {
  source: 'firebase',
  async getProfile(): Promise<ProfileSettings> {
    const session = authService.getStoredSession()
    const studentId = resolveStudentId()
    const reference = studentDoc<ProfileSettings>(studentId, 'profile', 'settings')
    const snapshot = await getDoc(reference)

    if (snapshot.exists()) {
      return snapshot.data()
    }

    const fallback = createDefaultProfileSettings(session?.user.name)
    await setDoc(reference, fallback, { merge: true })
    return fallback
  },
  async updateProfile(payload: UpdateProfilePayload): Promise<ProfileSettings> {
    const studentId = resolveStudentId()
    const reference = studentDoc<ProfileSettings>(studentId, 'profile', 'settings')
    const current = await this.getProfile()
    const next = applyProfilePatch(current, payload)

    await setDoc(reference, next, { merge: true })
    authService.updateStoredSessionUser({ name: next.name })

    return next
  },
}
