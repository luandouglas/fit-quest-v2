import type {
  StudentDashboard,
  StudentMealStatusInput,
  StudentProfilePreferencesPatch,
  StudentRepositorySource,
  StudentWaterIntakeInput,
  StudentWorkoutExecutionInput,
} from '@/shared/services/contracts/student'

import { getStudentRepository } from '@/shared/services/repositories/studentRepositoryFactory'

type StudentDashboardFilters = {
  date?: string
}

function getResolvedDate(date?: string) {
  if (date) {
    return date
  }

  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export const studentService = {
  getDataSource(): StudentRepositorySource {
    return getStudentRepository().source
  },
  async getDashboard({ date }: StudentDashboardFilters = {}): Promise<StudentDashboard> {
    return getStudentRepository().getDashboard({
      date: getResolvedDate(date),
    })
  },
  async getProfile() {
    return getStudentRepository().getProfile()
  },
  async getDailyProgress(date?: string) {
    return getStudentRepository().getDailyProgress(getResolvedDate(date))
  },
  async getWorkoutDay(date?: string) {
    return getStudentRepository().getWorkoutDay(getResolvedDate(date))
  },
  async getCardioSession(date?: string) {
    return getStudentRepository().getCardioSession(getResolvedDate(date))
  },
  async saveWorkoutExecution(input: StudentWorkoutExecutionInput) {
    await getStudentRepository().saveWorkoutExecution(input)
  },
  async getNutritionDayPlan(date?: string) {
    return getStudentRepository().getNutritionDayPlan(getResolvedDate(date))
  },
  async saveMealStatus(input: StudentMealStatusInput) {
    return getStudentRepository().saveMealStatus(input)
  },
  async registerMealQuick(date?: string): Promise<{ mealId: string | null }> {
    const plan = await getStudentRepository().getNutritionDayPlan(getResolvedDate(date))
    const pendingMeal = plan.meals.find((meal) => meal.status === 'pending')

    if (!pendingMeal) {
      return { mealId: null }
    }

    await getStudentRepository().saveMealStatus({
      date: getResolvedDate(date),
      mealId: pendingMeal.id,
      status: 'completed',
    })

    return { mealId: pendingMeal.id }
  },
  async saveWaterIntake(input: StudentWaterIntakeInput) {
    return getStudentRepository().saveWaterIntake(input)
  },
  async registerWaterQuick(ml = 300, date?: string): Promise<{ totalWaterMl: number }> {
    const response = await getStudentRepository().saveWaterIntake({
      date: getResolvedDate(date),
      amountMl: ml,
    })

    return {
      totalWaterMl: response.waterProgress.consumedMl,
    }
  },
  async getGamificationProfile() {
    return getStudentRepository().getGamificationProfile()
  },
  async getMetrics() {
    return getStudentRepository().getMetrics()
  },
  async getRankingSummary() {
    return getStudentRepository().getRankingSummary()
  },
  async getProfilePreferences() {
    return getStudentRepository().getProfilePreferences()
  },
  async saveProfilePreferences(patch: StudentProfilePreferencesPatch) {
    return getStudentRepository().saveProfilePreferences(patch)
  },
}
