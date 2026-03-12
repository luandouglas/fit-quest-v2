import { Redirect } from 'react-router-dom'

import { useAuth, useRole } from '@/shared/hooks'
import type { AuthUserRole } from '@/shared/types'

type GuardProps = {
  children: React.ReactNode
}

type RoleGuardProps = GuardProps & {
  allowedRoles: AuthUserRole[]
  fallbackTo?: string
}

export function getDefaultTabsPathByRole(role: AuthUserRole) {
  if (role === 'PERSONAL') {
    return '/tabs/personal/dashboard'
  }

  if (role === 'NUTRITIONIST') {
    return '/tabs/nutritionist/dashboard'
  }

  return '/tabs/student'
}

export function PrivateRoute({ children }: GuardProps) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Redirect to="/login" />
  }

  return <>{children}</>
}

export function PublicOnlyRoute({ children }: GuardProps) {
  const { isAuthenticated } = useAuth()
  const { role } = useRole()

  if (isAuthenticated) {
    return <Redirect to={getDefaultTabsPathByRole(role)} />
  }

  return <>{children}</>
}

export function RoleGuard({ children, allowedRoles, fallbackTo }: RoleGuardProps) {
  const { isAuthenticated } = useAuth()
  const { role, hasRole } = useRole()

  if (!isAuthenticated) {
    return <Redirect to="/login" />
  }

  if (!hasRole(allowedRoles)) {
    return <Redirect to={fallbackTo ?? getDefaultTabsPathByRole(role)} />
  }

  return <>{children}</>
}
