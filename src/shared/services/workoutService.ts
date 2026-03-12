import type {
  CreateQuickWorkoutInput,
  StartWorkoutSessionInput,
  UpdateWorkoutExerciseStatusInput,
  WorkoutDetail,
  WorkoutPlanSnapshot,
  WorkoutSession,
  WorkoutSessionSummary,
} from '@/shared/services/contracts/workout'
import { getWorkoutRepository } from '@/shared/services/repositories/workoutRepositoryFactory'

export const workoutService = {
  async getPlanSnapshot(): Promise<WorkoutPlanSnapshot> {
    return getWorkoutRepository().getPlanSnapshot()
  },
  async updateExerciseStatus(params: UpdateWorkoutExerciseStatusInput): Promise<void> {
    await getWorkoutRepository().updateExerciseStatus(params)
  },
  async getWorkoutDetail(workoutId: string): Promise<WorkoutDetail | null> {
    return getWorkoutRepository().getWorkoutDetail(workoutId)
  },
  async getWorkoutHistory(): Promise<WorkoutSessionSummary[]> {
    return getWorkoutRepository().getWorkoutHistory()
  },
  async getActiveSessionSnapshot() {
    return getWorkoutRepository().getActiveSession()
  },
  async getLastSessionSummary() {
    return getWorkoutRepository().getLastSessionSummary()
  },
  async startSession(input?: StartWorkoutSessionInput): Promise<WorkoutSession> {
    return getWorkoutRepository().startSession(input)
  },
  async saveSessionProgress(session: WorkoutSession): Promise<WorkoutSession> {
    return getWorkoutRepository().saveSessionProgress(session)
  },
  async completeSession(session: WorkoutSession): Promise<WorkoutSessionSummary> {
    return getWorkoutRepository().completeSession(session)
  },
  async createQuickWorkout(input?: CreateQuickWorkoutInput): Promise<WorkoutPlanSnapshot> {
    return getWorkoutRepository().createQuickWorkout(input)
  },
}
