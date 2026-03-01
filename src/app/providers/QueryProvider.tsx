import { type PropsWithChildren, useState } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'

import { createAppQueryClient } from './queryClient'

export function AppQueryProvider({ children }: PropsWithChildren) {
  const [queryClient] = useState(() => createAppQueryClient())

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
