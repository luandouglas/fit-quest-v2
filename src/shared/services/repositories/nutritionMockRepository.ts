import { NUTRITION_STORAGE_KEY } from '@/shared/constants'
import type { NutritionDaysMap } from '@/shared/services/contracts/nutrition'
import { createNutritionMockDays } from '@/shared/services/mocks/nutritionMockData'
import { storage } from '@/shared/services/storage'

function toIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export const nutritionMockRepository = {
  getDaysSnapshot(anchorDate = toIsoDate(new Date())): NutritionDaysMap {
    const cachedDays = storage.get<NutritionDaysMap>(NUTRITION_STORAGE_KEY)

    if (cachedDays && Object.keys(cachedDays).length > 0) {
      return cachedDays
    }

    const seeded = createNutritionMockDays(anchorDate)
    storage.set(NUTRITION_STORAGE_KEY, seeded)

    return seeded
  },
  saveDaysSnapshot(days: NutritionDaysMap) {
    storage.set(NUTRITION_STORAGE_KEY, days)
  },
}
