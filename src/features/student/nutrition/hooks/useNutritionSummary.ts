import { useCallback, useMemo } from 'react'

import { useQuery, useQueryClient } from '@tanstack/react-query'

import { nutritionService, type NutritionDay, type NutritionDaysMap } from '@/shared/services'
import type { NutritionPermissions } from '@/shared/services/contracts/nutrition'

import { nutritionQueryKeys } from './queryKeys'
import { cloneDay, recalculateDay } from './nutritionUtils'

export type NutritionUiState = 'loading' | 'ready' | 'empty' | 'error'

type UseNutritionSummaryParams = {
  anchorDate: string
  selectedDate: string
}

const defaultPermissions: NutritionPermissions = {
  hasActiveNutritionist: true,
  canEditPlan: false,
  canRegisterConsumption: true,
  canAddMealNotes: true,
  canUpdateWater: true,
}

export function useNutritionSummary({ anchorDate, selectedDate }: UseNutritionSummaryParams) {
  const queryClient = useQueryClient()
  const queryKey = nutritionQueryKeys.days(anchorDate)

  const query = useQuery({
    queryKey,
    queryFn: () => nutritionService.fetchDays(anchorDate),
    staleTime: 30_000,
  })

  const daysByDate = useMemo(() => query.data?.daysByDate ?? {}, [query.data?.daysByDate])
  const permissions = useMemo<NutritionPermissions>(
    () => query.data?.permissions ?? defaultPermissions,
    [query.data?.permissions],
  )

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
      queryClient.setQueryData(queryKey, (previous) => {
        const payload = previous as { daysByDate?: NutritionDaysMap; permissions?: NutritionPermissions } | undefined
        const safePrevious = payload?.daysByDate ?? {}
        const next = updater(safePrevious)
        nutritionService.saveDaysSnapshot(next)
        return {
          daysByDate: next,
          permissions: payload?.permissions ?? permissions,
        }
      })
    },
    [permissions, queryClient, queryKey],
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
    permissions,
    updateDaysByDate,
    refresh: query.refetch,
    invalidate,
  }
}

export type NutritionDaysUpdater = (previous: NutritionDaysMap) => NutritionDaysMap
export type { NutritionDay }
