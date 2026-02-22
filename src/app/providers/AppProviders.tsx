import { AuthProvider } from './AuthProvider'
import { FqToastProvider } from '@/shared/ui'

type AppProvidersProps = {
  children: React.ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AuthProvider>
      <FqToastProvider>{children}</FqToastProvider>
    </AuthProvider>
  )
}
