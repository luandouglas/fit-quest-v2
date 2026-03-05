export type ThemePreference = 'system' | 'light' | 'dark'

export type ProfileGoal = 'lose_weight' | 'gain_muscle' | 'maintenance' | 'performance'

export type ProfilePreferences = {
  notificationsEnabled: boolean
  remindersEnabled: boolean
  measurementSystem: 'metric' | 'imperial'
  themePreference: ThemePreference
}

export type ProfileGoals = {
  waterMlDaily: number
  workoutsPerWeek: number
}

export type ProfileSettings = {
  name: string
  city: string
  neighborhood: string
  gym: string
  goal: ProfileGoal
  goals: ProfileGoals
  preferences: ProfilePreferences
}

export type UpdateProfilePayload = Partial<{
  name: string
  city: string
  neighborhood: string
  gym: string
  goal: ProfileGoal
  goals: Partial<ProfileGoals>
  preferences: Partial<ProfilePreferences>
}>
