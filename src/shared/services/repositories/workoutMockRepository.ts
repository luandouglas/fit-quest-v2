import { mockExercises, mockWeek } from '@/pages/training-plan/data/mockTrainingPlan'
import type { ExerciseItem, TodayWorkout, TrainingPlanDay } from '@/pages/training-plan/types'

export const workoutMockRepository = {
  getWeek(): TrainingPlanDay[] {
    return mockWeek.map((day) => ({ ...day }))
  },
  getExercises(): ExerciseItem[] {
    return mockExercises.map((exercise) => ({ ...exercise }))
  },
  getTodayWorkout(progressPct: number, doneCount: number, totalCount: number): TodayWorkout {
    return {
      title: 'Upper Body Day',
      durationMin: 44,
      calories: 285,
      stars: 25,
      progressPct,
      completedCount: doneCount,
      totalCount,
    }
  },
}
