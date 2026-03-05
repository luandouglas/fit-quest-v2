import { httpClient } from '@/shared/services/http'
import type {
  CreateNutritionistDietInput,
  GrantNutritionistAchievementInput,
  NutritionistDashboardOverview,
  SendNutritionistMotivationInput,
} from '@/shared/services/contracts/nutritionist'
import type { BodyMeasurements, ProgressOverview } from '@/shared/services/contracts/progress'
import type { RequestStatus } from '@/shared/services/contracts/requests'

export const nutritionistService = {
  async getDashboardOverview(): Promise<NutritionistDashboardOverview> {
    return httpClient.get<NutritionistDashboardOverview>('/nutritionist/dashboard')
  },
  async createDiet(input: CreateNutritionistDietInput): Promise<NutritionistDashboardOverview> {
    return httpClient.post<NutritionistDashboardOverview, CreateNutritionistDietInput>('/nutritionist/diets', input)
  },
  async getStudentProgress(studentId: string): Promise<ProgressOverview> {
    return httpClient.get<ProgressOverview>('/nutritionist/students/progress', { query: { studentId } })
  },
  async reviewStudentWeight(input: { studentId: string; targetLogId: string; weightKg: number; comment: string }): Promise<{ saved: boolean }> {
    return httpClient.post<{ saved: boolean }, { studentId: string; targetLogId: string; weightKg: number; comment: string }>(
      '/nutritionist/students/progress/weight/review',
      input,
    )
  },
  async reviewStudentMeasurements(input: {
    studentId: string
    targetLogId: string
    measurements: BodyMeasurements
    comment: string
  }): Promise<{ saved: boolean }> {
    return httpClient.post<
      { saved: boolean },
      {
        studentId: string
        targetLogId: string
        measurements: BodyMeasurements
        comment: string
      }
    >('/nutritionist/students/progress/measurements/review', input)
  },
  async sendMotivationalMessage(input: SendNutritionistMotivationInput): Promise<{ sent: boolean }> {
    return httpClient.post<{ sent: boolean }, SendNutritionistMotivationInput>('/nutritionist/students/motivation', input)
  },
  async grantSpecialAchievement(input: GrantNutritionistAchievementInput): Promise<{ granted: boolean }> {
    return httpClient.post<{ granted: boolean }, GrantNutritionistAchievementInput>('/nutritionist/students/achievement', input)
  },
  async updateMeasurementsRequestStatus(input: { requestId: string; status: RequestStatus }): Promise<NutritionistDashboardOverview> {
    return httpClient.post<NutritionistDashboardOverview, { requestId: string; status: RequestStatus }>(
      '/nutritionist/requests/update',
      input,
    )
  },
}
