export type AuthUser = {
  id: string
  name: string
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

export type AuthStatus = 'anonymous' | 'authenticated' | 'loading'

export type AuthContextValue = {
  session: AuthSession | null
  user: AuthUser | null
  isAuthenticated: boolean
  status: AuthStatus
  error: string | null
  login: (credentials: AuthCredentials) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
}
