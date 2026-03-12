import type { ProfilePreferences } from '@/shared/services/contracts/profile'
import type {
  CardioSession,
  DailyProgress,
  GamificationProfile,
  NutritionDayPlan,
  RankingSummary,
  StudentDashboard,
  StudentMetrics,
  StudentProfile,
  StudentProfilePreferencesPatch,
  StudentRepositorySource,
  StudentMealStatusInput,
  StudentWaterIntakeInput,
  StudentWorkoutExecutionInput,
  WorkoutDay,
} from '@/shared/services/contracts/student'

export type StudentDashboardQuery = {
  date: string
}

export interface StudentRepository {
  readonly source: StudentRepositorySource
  getDashboard(query: StudentDashboardQuery): Promise<StudentDashboard>
  getProfile(): Promise<StudentProfile>
  getDailyProgress(date: string): Promise<DailyProgress>
  getWorkoutDay(date: string): Promise<WorkoutDay | null>
  getCardioSession(date: string): Promise<CardioSession | null>
  saveWorkoutExecution(input: StudentWorkoutExecutionInput): Promise<void>
  getNutritionDayPlan(date: string): Promise<NutritionDayPlan>
  saveMealStatus(input: StudentMealStatusInput): Promise<NutritionDayPlan>
  saveWaterIntake(input: StudentWaterIntakeInput): Promise<{
    nutritionPlan: NutritionDayPlan
    waterProgress: StudentDashboard['waterProgress']
  }>
  getGamificationProfile(): Promise<GamificationProfile>
  getMetrics(): Promise<StudentMetrics>
  getRankingSummary(): Promise<RankingSummary>
  getProfilePreferences(): Promise<ProfilePreferences>
  saveProfilePreferences(patch: StudentProfilePreferencesPatch): Promise<ProfilePreferences>
}
