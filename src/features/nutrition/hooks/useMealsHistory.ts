import { useMemo } from 'react'

import type { NutritionDay } from '@/shared/services'

import { buildHistory } from './nutritionUtils'

export function useMealsHistory(daysByDate: Record<string, NutritionDay>, anchorDate: string) {
  return useMemo(() => buildHistory(daysByDate, anchorDate), [daysByDate, anchorDate])
}
