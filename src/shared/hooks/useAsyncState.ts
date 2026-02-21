import { useMemo, useState } from 'react'

export function useAsyncState() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return useMemo(
    () => ({
      isLoading,
      error,
      startLoading: () => {
        setError(null)
        setIsLoading(true)
      },
      stopLoading: () => setIsLoading(false),
      setError,
      reset: () => {
        setError(null)
        setIsLoading(false)
      },
    }),
    [error, isLoading],
  )
}
