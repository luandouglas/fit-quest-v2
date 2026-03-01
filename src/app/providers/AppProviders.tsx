import { AuthProvider } from './AuthProvider'
import { AppQueryProvider } from './QueryProvider'
import { FqToastProvider } from '@/shared/ui'

type AppProvidersProps = {
  children: React.ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AppQueryProvider>
      <AuthProvider>
        <FqToastProvider>{children}</FqToastProvider>
      </AuthProvider>
    </AppQueryProvider>
  )
}
