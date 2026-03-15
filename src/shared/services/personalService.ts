import { httpClient } from '@/shared/services/http'
import type {
  CreatePersonalWorkoutInput,
  DeactivatePersonalWorkoutInput,
  GrantPersonalAchievementInput,
  PersonalDashboardOverview,
  PersonalStudentInviteLink,
  PersonalStudentWorkoutHistory,
  SendPersonalMotivationInput,
  UpdatePersonalWorkoutInput,
} from '@/shared/services/contracts/personal'
import type { BodyMeasurements } from '@/shared/services/contracts/progress'
import type { RequestStatus } from '@/shared/services/contracts/requests'
import { personalFirebaseService } from '@/shared/services/personalFirebaseService'

export const personalService = {
  async getDashboardOverview(): Promise<PersonalDashboardOverview> {
    return personalFirebaseService.getDashboardOverview()
  },
  async createWorkout(input: CreatePersonalWorkoutInput): Promise<PersonalDashboardOverview> {
    return personalFirebaseService.createWorkout(input)
  },
  async updateWorkout(input: UpdatePersonalWorkoutInput): Promise<PersonalDashboardOverview> {
    return personalFirebaseService.updateWorkout(input)
  },
  async deactivateWorkout(input: DeactivatePersonalWorkoutInput): Promise<PersonalDashboardOverview> {
    return personalFirebaseService.deactivateWorkout(input)
  },
  async getStudentWorkoutHistory(studentId: string): Promise<PersonalStudentWorkoutHistory> {
    return personalFirebaseService.getStudentWorkoutHistory(studentId)
  },
  async generateStudentInviteLink(): Promise<PersonalStudentInviteLink> {
    return personalFirebaseService.generateStudentInviteLink()
  },
  async sendMotivationalMessage(input: SendPersonalMotivationInput): Promise<{ sent: boolean }> {
    return httpClient.post<{ sent: boolean }, SendPersonalMotivationInput>('/personal/students/motivation', input)
  },
  async grantSpecialAchievement(input: GrantPersonalAchievementInput): Promise<{ granted: boolean }> {
    return httpClient.post<{ granted: boolean }, GrantPersonalAchievementInput>('/personal/students/achievement', input)
  },
  async updateMeasurementsRequestStatus(input: { requestId: string; status: RequestStatus }): Promise<PersonalDashboardOverview> {
    return httpClient.post<PersonalDashboardOverview, { requestId: string; status: RequestStatus }>('/personal/requests/update', input)
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
    >('/personal/students/progress/measurements/review', input)
  },
}
