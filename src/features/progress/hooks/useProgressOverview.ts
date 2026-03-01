import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import { progressService, type ProgressOverview } from '@/shared/services'

import { progressQueryKeys } from './queryKeys'

export type ProgressUiState = 'loading' | 'ready' | 'empty' | 'error'

export function useProgressOverview() {
  const query = useQuery({
    queryKey: progressQueryKeys.overview,
    queryFn: () => progressService.getOverview(),
    staleTime: 30_000,
  })

  const overview = useMemo(() => query.data ?? null, [query.data])

  const uiState: ProgressUiState = useMemo(() => {
    if (query.isPending) {
      return 'loading'
    }

    if (query.isError) {
      return 'error'
    }

    if (!overview) {
      return 'empty'
    }

    const hasAnyTraining = overview.recentHistory.length > 0 || overview.chart.some((point) => point.completedTrainings > 0)

    if (!hasAnyTraining) {
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

export type { ProgressOverview }
