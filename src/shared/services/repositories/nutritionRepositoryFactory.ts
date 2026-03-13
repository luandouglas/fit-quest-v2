import type { NutritionRepository } from './nutritionRepository'
import { nutritionFirebaseRepository } from './nutritionFirebaseRepository'

export function getNutritionRepository(): NutritionRepository {
  return nutritionFirebaseRepository
}
