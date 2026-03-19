import { PROFILE_SCHEMA_VERSION, PROFILE_STORAGE_KEY } from '@/shared/constants'
import { getProfileRepository } from '@/shared/services/repositories/profileRepositoryFactory'
import { storage } from '@/shared/services/storage'
import type { ProfileSettings, ThemePreference, UpdateProfilePayload } from '@/shared/services/contracts/profile'

function getSafeThemePreference(profile: Partial<ProfileSettings> | null | undefined): ThemePreference {
  const themePreference = profile?.preferences?.themePreference

  return themePreference === 'dark' || themePreference === 'light' || themePreference === 'system'
    ? themePreference
    : 'system'
}

function resolveThemePreference(themePreference: ThemePreference) {
  if (themePreference !== 'system') {
    return themePreference
  }

  if (typeof window === 'undefined') {
    return 'light'
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyThemeClass(themePreference: ThemePreference) {
  if (typeof document === 'undefined') {
    return
  }

  const root = document.documentElement
  root.classList.toggle('dark', resolveThemePreference(themePreference) === 'dark')
}

export const profileService = {
  applyThemePreference(themePreference: ThemePreference) {
    applyThemeClass(themePreference)
  },
  hydrateThemeFromStorage() {
    const stored = storage.get<{ version: number; profile: ProfileSettings }>(PROFILE_STORAGE_KEY)

    if (!stored || stored.version !== PROFILE_SCHEMA_VERSION) {
      return
    }

    applyThemeClass(getSafeThemePreference(stored.profile))
  },
  async getProfile(): Promise<ProfileSettings> {
    const profile = await getProfileRepository().getProfile()
    applyThemeClass(getSafeThemePreference(profile))
    return profile
  },
  async updateProfile(payload: UpdateProfilePayload): Promise<ProfileSettings> {
    const profile = await getProfileRepository().updateProfile(payload)
    applyThemeClass(getSafeThemePreference(profile))
    return profile
  },
}
