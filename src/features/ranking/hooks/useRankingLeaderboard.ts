import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import { rankingService, type RankingLeaderboard, type RankingLeague, type RankingPeriod, type RankingScope } from '@/shared/services'

import { rankingQueryKeys } from './queryKeys'

export type RankingUiState = 'loading' | 'ready' | 'empty' | 'error'

export function useRankingLeaderboard(period: RankingPeriod, scope: RankingScope, league: RankingLeague) {
  const query = useQuery({
    queryKey: rankingQueryKeys.leaderboard(period, scope, league),
    queryFn: () => rankingService.getLeaderboard({ period, scope, league }),
    staleTime: 10_000,
    refetchInterval: 20_000,
    refetchOnWindowFocus: true,
  })

  const leaderboard = useMemo(() => query.data ?? null, [query.data])

  const uiState: RankingUiState = useMemo(() => {
    if (query.isPending) {
      return 'loading'
    }

    if (query.isError) {
      return 'error'
    }

    if (!leaderboard || leaderboard.top.length === 0) {
      return 'empty'
    }

    return 'ready'
  }, [leaderboard, query.isError, query.isPending])

  return {
    leaderboard,
    uiState,
    refresh: query.refetch,
    error: query.error,
  }
}

export type { RankingLeaderboard }
