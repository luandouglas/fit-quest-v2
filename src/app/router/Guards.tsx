import { Redirect } from 'react-router-dom'

import { useAuth } from '@/shared/hooks'

type GuardProps = {
  children: React.ReactNode
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

  if (isAuthenticated) {
    return <Redirect to="/tabs/home" />
  }

  return <>{children}</>
}
