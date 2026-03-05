import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { runService } from '@/shared/services'

import { runQueryKeys } from './queryKeys'

export function useRunDashboard() {
  const queryClient = useQueryClient()

  const overviewQuery = useQuery({
    queryKey: runQueryKeys.overview,
    queryFn: () => runService.getOverview(),
    staleTime: 5_000,
    refetchInterval: 10_000,
  })

  const rankingQuery = useQuery({
    queryKey: runQueryKeys.ranking,
    queryFn: () => runService.getRankingSnapshot(),
    staleTime: 10_000,
  })

  const startRunMutation = useMutation({
    mutationFn: () => runService.startRun(),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: runQueryKeys.overview }),
        queryClient.invalidateQueries({ queryKey: runQueryKeys.ranking }),
        queryClient.invalidateQueries({ queryKey: ['progress'] }),
        queryClient.invalidateQueries({ queryKey: ['home', 'dashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['ranking'] }),
        queryClient.invalidateQueries({ queryKey: ['notifications'] }),
      ])
    },
  })

  const updateRunMutation = useMutation({
    mutationFn: runService.updateRunProgress,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: runQueryKeys.overview }),
        queryClient.invalidateQueries({ queryKey: ['progress'] }),
        queryClient.invalidateQueries({ queryKey: ['ranking'] }),
        queryClient.invalidateQueries({ queryKey: ['notifications'] }),
      ])
    },
  })

  const finishRunMutation = useMutation({
    mutationFn: runService.finishRun,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: runQueryKeys.overview }),
        queryClient.invalidateQueries({ queryKey: runQueryKeys.ranking }),
        queryClient.invalidateQueries({ queryKey: ['progress'] }),
        queryClient.invalidateQueries({ queryKey: ['home', 'dashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['gamification', 'overview'] }),
        queryClient.invalidateQueries({ queryKey: ['ranking'] }),
        queryClient.invalidateQueries({ queryKey: ['notifications'] }),
      ])
    },
  })

  return {
    overview: overviewQuery.data ?? null,
    ranking: rankingQuery.data ?? null,
    isLoading: overviewQuery.isPending,
    isError: overviewQuery.isError,
    error: overviewQuery.error,
    refresh: overviewQuery.refetch,
    startRun: startRunMutation.mutateAsync,
    updateRun: updateRunMutation.mutateAsync,
    finishRun: finishRunMutation.mutateAsync,
    isStartingRun: startRunMutation.isPending,
    isUpdatingRun: updateRunMutation.isPending,
    isFinishingRun: finishRunMutation.isPending,
  }
}
