export type AuthUserRole = 'STUDENT' | 'PERSONAL' | 'NUTRITIONIST'

export type ProfessionalProfile = {
  title: string
  license?: string
  specialties: string[]
}

export type AuthUser = {
  id: string
  name: string
  role: AuthUserRole
  professionalProfile?: ProfessionalProfile
}

export type AuthSession = {
  accessToken: string
  refreshToken?: string
  expiresAt: string
  user: AuthUser
}

export type AuthCredentials = {
  email: string
  password: string
}

export type AuthRegistrationInput = AuthCredentials & {
  name: string
  role: AuthUserRole
}

export type AuthStatus = 'anonymous' | 'authenticated' | 'loading'

export type AuthContextValue = {
  session: AuthSession | null
  user: AuthUser | null
  isAuthenticated: boolean
  status: AuthStatus
  error: string | null
  login: (credentials: AuthCredentials) => Promise<void>
  register: (input: AuthRegistrationInput) => Promise<void>
  logout: () => Promise<void>
  updateUser: (patch: Partial<AuthUser>) => void
  clearError: () => void
}
