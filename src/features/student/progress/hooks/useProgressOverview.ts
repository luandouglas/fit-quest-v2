import { useMemo } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { progressService, type ProgressOverview, type ProgressRange } from '@/shared/services'

import { progressQueryKeys } from './queryKeys'

export type ProgressUiState = 'loading' | 'ready' | 'empty' | 'error'

export function useProgressOverview(range: ProgressRange, enabled = true) {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: progressQueryKeys.overview(range),
    queryFn: () => progressService.getOverview(range),
    enabled,
    staleTime: 30_000,
  })

  const registerWeightMutation = useMutation({
    mutationFn: (input: { weightKg: number; date?: string }) => progressService.registerWeight(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: progressQueryKeys.root })
    },
  })

  const registerMeasurementsMutation = useMutation({
    mutationFn: (input: {
      date?: string
      comment?: string
      measurements: {
        chestCm: number
        waistCm: number
        hipsCm: number
        armCm: number
        thighCm: number
      }
    }) => progressService.registerBodyMeasurements(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: progressQueryKeys.root })
    },
  })

  const requestMeasurementsUpdateMutation = useMutation({
    mutationFn: (input?: { note?: string }) => progressService.requestMeasurementsUpdate(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const overview = useMemo(() => query.data ?? null, [query.data])

  const uiState: ProgressUiState = useMemo(() => {
    if (!enabled) {
      return 'empty'
    }

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
  }, [enabled, overview, query.isError, query.isPending])

  return {
    overview,
    uiState,
    refresh: query.refetch,
    error: query.error,
    registerWeight: registerWeightMutation.mutateAsync,
    registerMeasurements: registerMeasurementsMutation.mutateAsync,
    requestMeasurementsUpdate: requestMeasurementsUpdateMutation.mutateAsync,
    isRegisteringWeight: registerWeightMutation.isPending,
    isRegisteringMeasurements: registerMeasurementsMutation.isPending,
    isRequestingMeasurementsUpdate: requestMeasurementsUpdateMutation.isPending,
  }
}

export type { ProgressOverview }
