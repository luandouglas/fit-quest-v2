import { httpClient } from '@/shared/services/http'
import { getAuthProviderPreference, isFirebaseConfigured } from '@/shared/services/firebase'
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

function shouldUseFirebasePersonalService() {
  return getAuthProviderPreference() === 'firebase' && isFirebaseConfigured()
}

export const personalService = {
  async getDashboardOverview(): Promise<PersonalDashboardOverview> {
    if (shouldUseFirebasePersonalService()) {
      return personalFirebaseService.getDashboardOverview()
    }

    return httpClient.get<PersonalDashboardOverview>('/personal/dashboard')
  },
  async createWorkout(input: CreatePersonalWorkoutInput): Promise<PersonalDashboardOverview> {
    if (shouldUseFirebasePersonalService()) {
      return personalFirebaseService.createWorkout(input)
    }

    return httpClient.post<PersonalDashboardOverview, CreatePersonalWorkoutInput>('/personal/workouts', input)
  },
  async updateWorkout(input: UpdatePersonalWorkoutInput): Promise<PersonalDashboardOverview> {
    if (shouldUseFirebasePersonalService()) {
      return personalFirebaseService.updateWorkout(input)
    }

    return httpClient.post<PersonalDashboardOverview, UpdatePersonalWorkoutInput>('/personal/workouts/update', input)
  },
  async deactivateWorkout(input: DeactivatePersonalWorkoutInput): Promise<PersonalDashboardOverview> {
    if (shouldUseFirebasePersonalService()) {
      return personalFirebaseService.deactivateWorkout(input)
    }

    return httpClient.post<PersonalDashboardOverview, DeactivatePersonalWorkoutInput>('/personal/workouts/deactivate', input)
  },
  async getStudentWorkoutHistory(studentId: string): Promise<PersonalStudentWorkoutHistory> {
    if (shouldUseFirebasePersonalService()) {
      return personalFirebaseService.getStudentWorkoutHistory(studentId)
    }

    return httpClient.get<PersonalStudentWorkoutHistory>('/personal/students/history', { query: { studentId } })
  },
  async generateStudentInviteLink(): Promise<PersonalStudentInviteLink> {
    return httpClient.post<PersonalStudentInviteLink, Record<string, never>>('/personal/students/invite-link', {})
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
