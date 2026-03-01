import { AUTH_STORAGE_KEY, AUTH_TOKEN_STORAGE_KEY } from '@/shared/constants'
import { httpClient, setHttpAccessToken } from '@/shared/services/http'
import { storage } from '@/shared/services/storage'
import type { AuthUser } from '@/shared/types'

type LoginParams = {
  email: string
  password: string
}

type LoginResponse = {
  user: AuthUser
  accessToken: string
  refreshToken: string
}

function getStoredToken() {
  return storage.get<string>(AUTH_TOKEN_STORAGE_KEY)
}

export const authService = {
  getStoredUser(): AuthUser | null {
    return storage.get<AuthUser>(AUTH_STORAGE_KEY)
  },
  getStoredAccessToken(): string | null {
    return getStoredToken()
  },
  hydrateHttpToken() {
    setHttpAccessToken(getStoredToken())
  },
  persistLocalSession(user: AuthUser, accessToken?: string | null) {
    storage.set(AUTH_STORAGE_KEY, user)

    if (accessToken) {
      storage.set(AUTH_TOKEN_STORAGE_KEY, accessToken)
    }

    setHttpAccessToken(accessToken ?? getStoredToken())
  },
  clearLocalSession() {
    storage.remove(AUTH_STORAGE_KEY)
    storage.remove(AUTH_TOKEN_STORAGE_KEY)
    setHttpAccessToken(null)
  },
  async login(params: LoginParams): Promise<AuthUser> {
    const response = await httpClient.post<LoginResponse, LoginParams>('/auth/login', params)

    this.persistLocalSession(response.user, response.accessToken)

    return response.user
  },
  async logout(): Promise<void> {
    try {
      await httpClient.post<null>('/auth/logout')
    } finally {
      this.clearLocalSession()
    }
  },
}
