import { useMemo } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { homeService } from '@/shared/services'

import { homeQueryKeys } from './queryKeys'

export type HomeUiState = 'loading' | 'ready' | 'empty' | 'error'

export function useHomeDashboard() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: homeQueryKeys.dashboard,
    queryFn: () => homeService.getDashboardOverview(),
    staleTime: 0,
    refetchInterval: 15_000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  })

  const registerMealMutation = useMutation({
    mutationFn: () => homeService.registerMealQuick(),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: homeQueryKeys.dashboard }),
        queryClient.invalidateQueries({ queryKey: ['progress'] }),
        queryClient.invalidateQueries({ queryKey: ['gamification', 'overview'] }),
        queryClient.invalidateQueries({ queryKey: ['ranking'] }),
        queryClient.invalidateQueries({ queryKey: ['notifications'] }),
      ])
    },
  })

  const registerWaterMutation = useMutation({
    mutationFn: (ml: number) => homeService.registerWaterQuick(ml),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: homeQueryKeys.dashboard }),
        queryClient.invalidateQueries({ queryKey: ['progress'] }),
        queryClient.invalidateQueries({ queryKey: ['gamification', 'overview'] }),
        queryClient.invalidateQueries({ queryKey: ['ranking'] }),
        queryClient.invalidateQueries({ queryKey: ['notifications'] }),
      ])
    },
  })

  const uiState: HomeUiState = useMemo(() => {
    if (query.isPending) {
      return 'loading'
    }

    if (query.isError) {
      return 'error'
    }

    const overview = query.data

    if (!overview) {
      return 'empty'
    }

    const hasData =
      overview.summary.todayWorkout.hasWorkout ||
      overview.summary.mealsTotal > 0 ||
      overview.summary.waterGoalMl > 0 ||
      overview.summary.xpToday > 0

    return hasData ? 'ready' : 'empty'
  }, [query.data, query.isError, query.isPending])

  return {
    overview: query.data ?? null,
    uiState,
    error: query.error,
    refresh: query.refetch,
    registerMeal: registerMealMutation.mutateAsync,
    registerWater: registerWaterMutation.mutateAsync,
    isRegisterMealPending: registerMealMutation.isPending,
    isRegisterWaterPending: registerWaterMutation.isPending,
  }
}
