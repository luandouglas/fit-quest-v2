import { useMemo } from 'react'

import type { AuthUserRole } from '@/shared/types'

import { useAuth } from './useAuth'

export function useRole() {
  const { user } = useAuth()

  const role: AuthUserRole = user?.role ?? 'STUDENT'

  const isStudent = role === 'STUDENT'
  const isPersonal = role === 'PERSONAL'
  const isNutritionist = role === 'NUTRITIONIST'

  const hasRole = useMemo(
    () => (roles: AuthUserRole[]) => roles.includes(role),
    [role],
  )

  return {
    role,
    isStudent,
    isPersonal,
    isNutritionist,
    hasRole,
  }
}
