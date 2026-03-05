import { httpClient } from '@/shared/services/http'
import { PROFILE_SCHEMA_VERSION, PROFILE_STORAGE_KEY } from '@/shared/constants'
import { storage } from '@/shared/services/storage'
import type { ProfileSettings, ThemePreference, UpdateProfilePayload } from '@/shared/services/contracts/profile'

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

    applyThemeClass(stored.profile.preferences.themePreference)
  },
  async getProfile(): Promise<ProfileSettings> {
    const profile = await httpClient.get<ProfileSettings>('/profile')
    applyThemeClass(profile.preferences.themePreference)
    return profile
  },
  async updateProfile(payload: UpdateProfilePayload): Promise<ProfileSettings> {
    const profile = await httpClient.patch<ProfileSettings, { patch: UpdateProfilePayload }>('/profile', {
      patch: payload,
    })
    applyThemeClass(profile.preferences.themePreference)
    return profile
  },
}
