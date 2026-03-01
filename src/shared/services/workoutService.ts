import type { ExerciseItem } from '@/pages/training-plan/types'
import type { WorkoutPlanSnapshot } from '@/shared/services/contracts/workout'
import { httpClient } from '@/shared/services/http'
import { workoutMockRepository } from '@/shared/services/repositories/workoutMockRepository'

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
  async getPlanSnapshot(): Promise<WorkoutPlanSnapshot> {
    return httpClient.get<WorkoutPlanSnapshot>('/workouts/plan/snapshot')
  },
  async updateExerciseStatus(params: { id: string; status: ExerciseItem['status'] }): Promise<void> {
    await httpClient.patch('/workouts/exercises/status', params)
  },
}
