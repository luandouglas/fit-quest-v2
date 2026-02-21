import { createContext, useCallback, useContext, useMemo, useState } from 'react'

import type { AuthContextValue, AuthUser } from '@/shared/types'
import { AUTH_STORAGE_KEY } from '@/shared/constants'
import { storage } from '@/shared/services'

type AuthProviderProps = {
  children: React.ReactNode
}

const AuthContext = createContext<AuthContextValue | null>(null)

function getInitialUser() {
  return storage.get<AuthUser>(AUTH_STORAGE_KEY)
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(getInitialUser)

  const login = useCallback((nextUser: AuthUser) => {
    setUser(nextUser)
    storage.set(AUTH_STORAGE_KEY, nextUser)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    storage.remove(AUTH_STORAGE_KEY)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      logout,
    }),
    [user, login, logout],
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
