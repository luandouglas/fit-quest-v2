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

function isProfileGoal(value: unknown): value is ProfileSettings['goal'] {
  return (
    value === 'lose_weight' ||
    value === 'gain_muscle' ||
    value === 'maintenance' ||
    value === 'performance'
  )
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark'
}

function normalizeProfileSettings(
  candidate: Partial<ProfileSettings> | undefined,
  fallback: ProfileSettings,
): ProfileSettings {
  const requestedWaterGoal = Number(candidate?.goals?.waterMlDaily)
  const requestedWorkoutsPerWeek = Number(candidate?.goals?.workoutsPerWeek)

  return {
    name: typeof candidate?.name === 'string' && candidate.name.trim().length > 0 ? candidate.name.trim() : fallback.name,
    city: typeof candidate?.city === 'string' && candidate.city.trim().length > 0 ? candidate.city.trim() : fallback.city,
    neighborhood:
      typeof candidate?.neighborhood === 'string' && candidate.neighborhood.trim().length > 0
        ? candidate.neighborhood.trim()
        : fallback.neighborhood,
    gym: typeof candidate?.gym === 'string' && candidate.gym.trim().length > 0 ? candidate.gym.trim() : fallback.gym,
    goal: isProfileGoal(candidate?.goal) ? candidate.goal : fallback.goal,
    goals: {
      waterMlDaily: Number.isFinite(requestedWaterGoal)
        ? clamp(Math.round(requestedWaterGoal), 500, 8000)
        : fallback.goals.waterMlDaily,
      workoutsPerWeek: Number.isFinite(requestedWorkoutsPerWeek)
        ? clamp(Math.round(requestedWorkoutsPerWeek), 1, 14)
        : fallback.goals.workoutsPerWeek,
    },
    preferences: {
      notificationsEnabled:
        typeof candidate?.preferences?.notificationsEnabled === 'boolean'
          ? candidate.preferences.notificationsEnabled
          : fallback.preferences.notificationsEnabled,
      remindersEnabled:
        typeof candidate?.preferences?.remindersEnabled === 'boolean'
          ? candidate.preferences.remindersEnabled
          : fallback.preferences.remindersEnabled,
      measurementSystem:
        candidate?.preferences?.measurementSystem === 'imperial' ||
        candidate?.preferences?.measurementSystem === 'metric'
          ? candidate.preferences.measurementSystem
          : fallback.preferences.measurementSystem,
      themePreference: isThemePreference(candidate?.preferences?.themePreference)
        ? candidate.preferences.themePreference
        : fallback.preferences.themePreference,
    },
  }
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
    const fallback = createDefaultProfileSettings(session?.user.name)

    if (snapshot.exists()) {
      const normalized = normalizeProfileSettings(snapshot.data(), fallback)
      await setDoc(reference, normalized, { merge: true })
      return normalized
    }

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
