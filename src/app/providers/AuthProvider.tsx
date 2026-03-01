import { createContext, useCallback, useContext, useMemo, useReducer } from 'react'

import { authService } from '@/shared/services'
import type { AuthContextValue, AuthCredentials, AuthSession, AuthStatus } from '@/shared/types'

type AuthProviderProps = {
  children: React.ReactNode
}

type AuthState = {
  session: AuthSession | null
  status: AuthStatus
  error: string | null
}

type AuthAction =
  | { type: 'login_start' }
  | { type: 'login_success'; session: AuthSession }
  | { type: 'login_error'; message: string }
  | { type: 'logout' }
  | { type: 'clear_error' }

const AuthContext = createContext<AuthContextValue | null>(null)

function createInitialState(): AuthState {
  const session = authService.getStoredSession()

  return {
    session,
    status: session ? 'authenticated' : 'anonymous',
    error: null,
  }
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'login_start':
      return {
        ...state,
        status: 'loading',
        error: null,
      }
    case 'login_success':
      return {
        session: action.session,
        status: 'authenticated',
        error: null,
      }
    case 'login_error':
      return {
        session: null,
        status: 'anonymous',
        error: action.message,
      }
    case 'logout':
      return {
        session: null,
        status: 'anonymous',
        error: null,
      }
    case 'clear_error':
      return {
        ...state,
        error: null,
      }
    default:
      return state
  }
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return 'Unable to authenticate'
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, undefined, createInitialState)

  const login = useCallback(async (credentials: AuthCredentials) => {
    dispatch({ type: 'login_start' })

    try {
      const session = await authService.login(credentials)
      dispatch({ type: 'login_success', session })
    } catch (error) {
      dispatch({ type: 'login_error', message: getErrorMessage(error) })
      throw error
    }
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    dispatch({ type: 'logout' })
  }, [])

  const clearError = useCallback(() => {
    dispatch({ type: 'clear_error' })
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session: state.session,
      user: state.session?.user ?? null,
      isAuthenticated: state.status === 'authenticated' && Boolean(state.session),
      status: state.status,
      error: state.error,
      login,
      logout,
      clearError,
    }),
    [state, login, logout, clearError],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuthContext must be used inside AuthProvider')
  }

  return context
}
