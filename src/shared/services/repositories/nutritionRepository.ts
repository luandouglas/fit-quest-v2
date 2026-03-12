import type { StudentRepositorySource } from '@/shared/services/contracts/student'
import type {
  AddNutritionWaterEntryInput,
  NutritionDay,
  NutritionDaysMap,
  NutritionDaysPayload,
  UpdateNutritionMealNoteInput,
  UpdateNutritionMealStatusInput,
  UpdateNutritionWaterGoalInput,
} from '@/shared/services/contracts/nutrition'

export interface NutritionRepository {
  readonly source: StudentRepositorySource
  getDaysSnapshot(anchorDate?: string): NutritionDaysMap
  saveDaysSnapshot(days: NutritionDaysMap): void
  getDays(anchorDate: string): Promise<NutritionDaysPayload>
  updateMealStatus(input: UpdateNutritionMealStatusInput): Promise<NutritionDay>
  updateMealNote(input: UpdateNutritionMealNoteInput): Promise<NutritionDay>
  addWaterEntry(input: AddNutritionWaterEntryInput): Promise<NutritionDay>
  removeLastWaterEntry(input: Pick<AddNutritionWaterEntryInput, 'date'>): Promise<NutritionDay>
  updateWaterGoal(input: UpdateNutritionWaterGoalInput): Promise<NutritionDay>
}
