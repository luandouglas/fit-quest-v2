import type { ExerciseItem } from '@/pages/training-plan/types'
import type {
  CreateQuickWorkoutInput,
  StartWorkoutSessionInput,
  WorkoutPlanSnapshot,
  WorkoutSession,
  WorkoutSessionSummary,
} from '@/shared/services/contracts/workout'
import { httpClient } from '@/shared/services/http'
import { workoutMockRepository } from '@/shared/services/repositories/workoutMockRepository'
import { workoutSessionMockRepository } from '@/shared/services/repositories/workoutSessionMockRepository'

export const workoutService = {
  getWeekSnapshot() {
    return workoutMockRepository.getWeek()
  },
  getExercisesSnapshot() {
    return workoutMockRepository.getExercises()
  },
  getTodayWorkoutSnapshot(progressPct: number, doneCount: number, totalCount: number) {
    return workoutMockRepository.getTodayWorkout(progressPct, doneCount, totalCount)
  },
  createQuickWorkoutSnapshot(input?: CreateQuickWorkoutInput) {
    return workoutMockRepository.createQuickWorkout(input)
  },
  async getPlanSnapshot(): Promise<WorkoutPlanSnapshot> {
    return httpClient.get<WorkoutPlanSnapshot>('/workouts/plan/snapshot')
  },
  async updateExerciseStatus(params: { id: string; status: ExerciseItem['status'] }): Promise<void> {
    await httpClient.patch('/workouts/exercises/status', params)
  },
  getActiveSessionSnapshot() {
    return workoutSessionMockRepository.getActiveSession()
  },
  getLastSessionSummary() {
    return workoutSessionMockRepository.getLastSummary()
  },
  async startSession(input?: StartWorkoutSessionInput): Promise<WorkoutSession> {
    return httpClient.post<WorkoutSession, StartWorkoutSessionInput>('/workouts/session/start', input)
  },
  async saveSessionProgress(session: WorkoutSession): Promise<WorkoutSession> {
    return httpClient.patch<WorkoutSession, { session: WorkoutSession }>('/workouts/session/progress', {
      session,
    })
  },
  async completeSession(session: WorkoutSession): Promise<WorkoutSessionSummary> {
    return httpClient.post<WorkoutSessionSummary, { session: WorkoutSession }>('/workouts/session/complete', {
      session,
    })
  },
  async createQuickWorkout(input?: CreateQuickWorkoutInput): Promise<WorkoutPlanSnapshot> {
    return httpClient.post<WorkoutPlanSnapshot, CreateQuickWorkoutInput>('/workouts/quick/create', input)
  },
}
