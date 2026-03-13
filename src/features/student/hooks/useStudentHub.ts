import { useMemo } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { studentService } from '@/shared/services'

import { invalidateStudentExperienceQueries } from './invalidateStudentExperienceQueries'
import { studentQueryKeys } from './queryKeys'

export type StudentHubUiState = 'loading' | 'ready' | 'empty' | 'error'

export function useStudentHub(date: string, enabled = true) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: studentQueryKeys.dashboard(date),
    queryFn: () => studentService.getDashboard({ date }),
    enabled,
    staleTime: 10_000,
    refetchInterval: enabled ? 20_000 : false,
    refetchOnWindowFocus: true,
  })

  const registerMealMutation = useMutation({
    mutationFn: () => studentService.registerMealQuick(date),
    onSuccess: async () => {
      await invalidateStudentExperienceQueries(queryClient)
    },
  })

  const registerWaterMutation = useMutation({
    mutationFn: (ml: number) => studentService.registerWaterQuick(ml, date),
    onSuccess: async () => {
      await invalidateStudentExperienceQueries(queryClient)
    },
  })

  const uiState: StudentHubUiState = useMemo(() => {
    if (!enabled) {
      return 'empty'
    }

    if (query.isPending) {
      return 'loading'
    }

    if (query.isError) {
      return 'error'
    }

    if (!query.data) {
      return 'empty'
    }

    return 'ready'
  }, [enabled, query.data, query.isError, query.isPending])

  return {
    dashboard: query.data ?? null,
    uiState,
    error: query.error,
    refresh: query.refetch,
    registerMeal: registerMealMutation.mutateAsync,
    registerWater: registerWaterMutation.mutateAsync,
    isRegisterMealPending: registerMealMutation.isPending,
    isRegisterWaterPending: registerWaterMutation.isPending,
  }
}
