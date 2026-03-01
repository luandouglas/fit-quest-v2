import { useCallback, useMemo } from 'react'

import { useQuery, useQueryClient } from '@tanstack/react-query'

import { nutritionService, type NutritionDay, type NutritionDaysMap } from '@/shared/services'

import { nutritionQueryKeys } from './queryKeys'
import { cloneDay, recalculateDay } from './nutritionUtils'

export type NutritionUiState = 'loading' | 'ready' | 'empty' | 'error'

type UseNutritionSummaryParams = {
  anchorDate: string
  selectedDate: string
}

export function useNutritionSummary({ anchorDate, selectedDate }: UseNutritionSummaryParams) {
  const queryClient = useQueryClient()
  const queryKey = nutritionQueryKeys.days(anchorDate)

  const query = useQuery({
    queryKey,
    queryFn: () => nutritionService.fetchDays(anchorDate),
    staleTime: 30_000,
  })

  const daysByDate = useMemo(() => query.data ?? {}, [query.data])

  const currentDay = useMemo(() => {
    const day = daysByDate[selectedDate]

    if (!day) {
      return null
    }

    return recalculateDay(cloneDay(day))
  }, [daysByDate, selectedDate])

  const uiState: NutritionUiState = useMemo(() => {
    if (query.isPending) {
      return 'loading'
    }

    if (query.isError) {
      return 'error'
    }

    if (!currentDay || !currentDay.meals.length) {
      return 'empty'
    }

    return 'ready'
  }, [currentDay, query.isError, query.isPending])

  const updateDaysByDate = useCallback(
    (updater: (previous: NutritionDaysMap) => NutritionDaysMap) => {
      queryClient.setQueryData<NutritionDaysMap>(queryKey, (previous) => {
        const safePrevious = previous ?? {}
        const next = updater(safePrevious)
        nutritionService.saveDaysSnapshot(next)
        return next
      })
    },
    [queryClient, queryKey],
  )

  const invalidate = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey })
  }, [queryClient, queryKey])

  return {
    daysByDate,
    currentDay,
    uiState,
    isError: query.isError,
    error: query.error,
    updateDaysByDate,
    refresh: query.refetch,
    invalidate,
  }
}

export type NutritionDaysUpdater = (previous: NutritionDaysMap) => NutritionDaysMap
export type { NutritionDay }
