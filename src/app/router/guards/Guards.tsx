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

function AuthGuardLoader() {
  return (
    <div
      className="flex min-h-[40vh] items-center justify-center px-6 text-sm text-muted-foreground"
      role="status"
      aria-live="polite"
    >
      Carregando sessao...
    </div>
  )
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
  const { isAuthenticated, status } = useAuth()

  if (status === 'loading') {
    return <AuthGuardLoader />
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />
  }

  return <>{children}</>
}

export function PublicOnlyRoute({ children }: GuardProps) {
  const { isAuthenticated, status } = useAuth()
  const { role } = useRole()

  if (status === 'loading') {
    return <AuthGuardLoader />
  }

  if (isAuthenticated) {
    return <Redirect to={getDefaultTabsPathByRole(role)} />
  }

  return <>{children}</>
}

export function RoleGuard({ children, allowedRoles, fallbackTo }: RoleGuardProps) {
  const { isAuthenticated, status } = useAuth()
  const { role, hasRole } = useRole()

  if (status === 'loading') {
    return <AuthGuardLoader />
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />
  }

  if (!hasRole(allowedRoles)) {
    return <Redirect to={fallbackTo ?? getDefaultTabsPathByRole(role)} />
  }

  return <>{children}</>
}
