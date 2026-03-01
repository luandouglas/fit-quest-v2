import {
  AUTH_SESSION_SCHEMA_VERSION,
  AUTH_SESSION_STORAGE_KEY,
} from '@/shared/constants'
import { HttpError, httpClient, setHttpAccessToken } from '@/shared/services/http'
import { storage } from '@/shared/services/storage'
import type { AuthCredentials, AuthSession } from '@/shared/types'

type LoginResponse = {
  session: AuthSession
}

type PersistedAuthSession = {
  version: number
  session: AuthSession
}

function isValidSessionShape(value: unknown): value is PersistedAuthSession {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<PersistedAuthSession>

  return (
    typeof candidate.version === 'number' &&
    candidate.session !== null &&
    typeof candidate.session === 'object' &&
    typeof (candidate.session as AuthSession).accessToken === 'string' &&
    typeof (candidate.session as AuthSession).expiresAt === 'string' &&
    typeof (candidate.session as AuthSession).user?.id === 'string' &&
    typeof (candidate.session as AuthSession).user?.name === 'string'
  )
}

function isExpired(expiresAt: string) {
  const timestamp = Date.parse(expiresAt)

  if (Number.isNaN(timestamp)) {
    return true
  }

  return timestamp <= Date.now()
}

function toPersistedSession(session: AuthSession): PersistedAuthSession {
  return {
    version: AUTH_SESSION_SCHEMA_VERSION,
    session,
  }
}

export const authService = {
  getStoredSession(): AuthSession | null {
    const raw = storage.get<unknown>(AUTH_SESSION_STORAGE_KEY)

    if (!isValidSessionShape(raw)) {
      storage.remove(AUTH_SESSION_STORAGE_KEY)
      return null
    }

    if (raw.version !== AUTH_SESSION_SCHEMA_VERSION) {
      storage.remove(AUTH_SESSION_STORAGE_KEY)
      return null
    }

    if (isExpired(raw.session.expiresAt)) {
      storage.remove(AUTH_SESSION_STORAGE_KEY)
      return null
    }

    return raw.session
  },
  hydrateHttpToken() {
    const session = this.getStoredSession()
    setHttpAccessToken(session?.accessToken ?? null)
  },
  persistSession(session: AuthSession) {
    storage.set(AUTH_SESSION_STORAGE_KEY, toPersistedSession(session))
    setHttpAccessToken(session.accessToken)
  },
  clearSession() {
    storage.remove(AUTH_SESSION_STORAGE_KEY)
    setHttpAccessToken(null)
  },
  async login(credentials: AuthCredentials): Promise<AuthSession> {
    const response = await httpClient.post<LoginResponse, AuthCredentials>('/auth/login', credentials)

    this.persistSession(response.session)

    return response.session
  },
  async logout(): Promise<void> {
    try {
      await httpClient.post<null>('/auth/logout')
    } catch (error) {
      if (!(error instanceof HttpError)) {
        throw error
      }
    } finally {
      this.clearSession()
    }
  },
}
