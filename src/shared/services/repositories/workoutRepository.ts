import type {
  CreateQuickWorkoutInput,
  StartWorkoutSessionInput,
  UpdateWorkoutExerciseStatusInput,
  WorkoutDetail,
  WorkoutPlanSnapshot,
  WorkoutSession,
  WorkoutSessionSummary,
} from '@/shared/services/contracts/workout'
import type { StudentRepositorySource } from '@/shared/services/contracts/student'

export interface WorkoutRepository {
  readonly source: StudentRepositorySource
  getPlanSnapshot(): Promise<WorkoutPlanSnapshot>
  updateExerciseStatus(input: UpdateWorkoutExerciseStatusInput): Promise<void>
  getWorkoutDetail(workoutId: string): Promise<WorkoutDetail | null>
  getWorkoutHistory(): Promise<WorkoutSessionSummary[]>
  getActiveSession(): Promise<WorkoutSession | null>
  getLastSessionSummary(): Promise<WorkoutSessionSummary | null>
  startSession(input?: StartWorkoutSessionInput): Promise<WorkoutSession>
  saveSessionProgress(session: WorkoutSession): Promise<WorkoutSession>
  completeSession(session: WorkoutSession): Promise<WorkoutSessionSummary>
  createQuickWorkout(input?: CreateQuickWorkoutInput): Promise<WorkoutPlanSnapshot>
}
