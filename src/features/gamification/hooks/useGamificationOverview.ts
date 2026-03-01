import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import { gamificationService, type GamificationOverview } from '@/shared/services'

import { gamificationQueryKeys } from './queryKeys'

export type GamificationUiState = 'loading' | 'ready' | 'empty' | 'error'

export function useGamificationOverview() {
  const query = useQuery({
    queryKey: gamificationQueryKeys.overview,
    queryFn: () => gamificationService.getOverview(),
    staleTime: 30_000,
  })

  const overview = useMemo(() => query.data ?? null, [query.data])

  const uiState: GamificationUiState = useMemo(() => {
    if (query.isPending) {
      return 'loading'
    }

    if (query.isError) {
      return 'error'
    }

    if (!overview) {
      return 'empty'
    }

    return 'ready'
  }, [overview, query.isError, query.isPending])

  return {
    overview,
    uiState,
    refresh: query.refetch,
    error: query.error,
  }
}

export type { GamificationOverview }
