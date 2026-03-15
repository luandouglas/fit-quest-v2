import { workoutDayStatuses, type WorkoutDayStatus } from '@/shared/services/contracts/student'
import { workoutPlanStatuses, type WorkoutPlanStatus } from '@/shared/services/contracts/workout'

export type StudentWorkoutAvailabilityStatus = WorkoutPlanStatus | WorkoutDayStatus | null | undefined

export function canStudentStartWorkout(status: StudentWorkoutAvailabilityStatus) {
  return (
    status === workoutPlanStatuses.pending ||
    status === workoutDayStatuses.scheduled ||
    status === workoutDayStatuses.inProgress
  )
}

export function isStudentWorkoutExpired(status: StudentWorkoutAvailabilityStatus) {
  return status === workoutPlanStatuses.late || status === workoutDayStatuses.skipped
}
