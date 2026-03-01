import { useEffect, useMemo, useState } from 'react'

import { workoutService } from '@/shared/services'
import type { ExerciseItem, TrainingPlanUiState, TodayWorkout } from '../types'

const LOADING_DELAY_MS = 450

export function useTrainingPlanState() {
  const [uiState, setUiState] = useState<TrainingPlanUiState>('loading')
  const [hasWorkoutToday, setHasWorkoutToday] = useState(true)
  const [exercises, setExercises] = useState<ExerciseItem[]>(() => workoutService.getExercisesSnapshot())

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setUiState('ready')
    }, LOADING_DELAY_MS)

    return () => window.clearTimeout(timeout)
  }, [])

  const doneCount = useMemo(
    () => exercises.filter((exercise) => exercise.status === 'done').length,
    [exercises],
  )
  const totalCount = exercises.length
  const progressPct = Math.round((doneCount / Math.max(totalCount, 1)) * 100)

  const todayWorkout: TodayWorkout = useMemo(
    () => workoutService.getTodayWorkoutSnapshot(progressPct, doneCount, totalCount),
    [doneCount, totalCount, progressPct],
  )

  const totalDurationMin = useMemo(
    () => exercises.reduce((totalValue, exercise) => totalValue + exercise.durationMin, 0),
    [exercises],
  )

  const isStarted = useMemo(
    () => exercises.some((exercise) => exercise.status === 'current' || exercise.status === 'done'),
    [exercises],
  )

  function setCurrentExercise(id: string) {
    setExercises((currentExercises) => {
      const hasTarget = currentExercises.some((exercise) => exercise.id === id)

      if (!hasTarget) {
        return currentExercises
      }

      return currentExercises.map((exercise) => {
        if (exercise.id === id && exercise.status !== 'done') {
          return { ...exercise, status: 'current' }
        }

        if (exercise.status === 'current' && exercise.id !== id) {
          return { ...exercise, status: 'upcoming' }
        }

        return exercise
      })
    })
  }

  function toggleExerciseDone(id: string) {
    setExercises((currentExercises) => {
      const nextExercises = currentExercises.map((exercise) => {
        if (exercise.id !== id) {
          return exercise
        }

        const nextStatus: ExerciseItem['status'] = exercise.status === 'done' ? 'upcoming' : 'done'

        return {
          ...exercise,
          status: nextStatus,
        }
      })

      const hasCurrent = nextExercises.some((exercise) => exercise.status === 'current')

      if (!hasCurrent) {
        const firstUpcomingIndex = nextExercises.findIndex((exercise) => exercise.status === 'upcoming')

        if (firstUpcomingIndex >= 0) {
          nextExercises[firstUpcomingIndex] = {
            ...nextExercises[firstUpcomingIndex],
            status: 'current',
          }
        }
      }

      return nextExercises
    })
  }

  function retryLoad() {
    setUiState('loading')
    window.setTimeout(() => setUiState('ready'), LOADING_DELAY_MS)
  }

  return {
    uiState,
    hasWorkoutToday,
    exercises,
    progressPct,
    todayWorkout,
    totalDurationMin,
    isStarted,
    setUiState,
    setHasWorkoutToday,
    setCurrentExercise,
    toggleExerciseDone,
    retryLoad,
  }
}
