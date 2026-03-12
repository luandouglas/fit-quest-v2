import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { invalidateStudentExperienceQueries } from '@/features/student/hooks/invalidateStudentExperienceQueries'
import { runService } from '@/shared/services'
import type { StartRunInput } from '@/shared/services/contracts/run'

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

  const lastCompletedQuery = useQuery({
    queryKey: runQueryKeys.lastCompleted,
    queryFn: () => runService.getLastCompletedSession(),
    staleTime: 10_000,
  })

  const startRunMutation = useMutation({
    mutationFn: (input?: StartRunInput) => runService.startRun(input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: runQueryKeys.overview }),
        queryClient.invalidateQueries({ queryKey: runQueryKeys.ranking }),
        queryClient.invalidateQueries({ queryKey: runQueryKeys.lastCompleted }),
        invalidateStudentExperienceQueries(queryClient, { includeNutrition: false }),
      ])
    },
  })

  const updateRunMutation = useMutation({
    mutationFn: runService.updateRunProgress,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: runQueryKeys.overview }),
        queryClient.invalidateQueries({ queryKey: runQueryKeys.lastCompleted }),
        invalidateStudentExperienceQueries(queryClient, { includeNutrition: false }),
      ])
    },
  })

  const finishRunMutation = useMutation({
    mutationFn: runService.finishRun,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: runQueryKeys.overview }),
        queryClient.invalidateQueries({ queryKey: runQueryKeys.ranking }),
        queryClient.invalidateQueries({ queryKey: runQueryKeys.lastCompleted }),
        invalidateStudentExperienceQueries(queryClient, { includeNutrition: false }),
      ])
    },
  })

  return {
    overview: overviewQuery.data ?? null,
    ranking: rankingQuery.data ?? null,
    lastCompletedSession: lastCompletedQuery.data ?? null,
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
