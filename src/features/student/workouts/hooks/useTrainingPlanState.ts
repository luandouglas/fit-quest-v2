import { useMemo, useState } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { workoutService } from '@/shared/services'

const workoutPlanQueryKey = ['workouts', 'plan'] as const
const activeSessionQueryKey = ['workouts', 'active-session'] as const
const lastSummaryQueryKey = ['workouts', 'last-summary'] as const

export function useTrainingPlanState() {
  const queryClient = useQueryClient()
  const [selectedDateOverride, setSelectedDateOverride] = useState<string | null>(null)

  const planQuery = useQuery({
    queryKey: workoutPlanQueryKey,
    queryFn: () => workoutService.getPlanSnapshot(),
    staleTime: 10_000,
    refetchInterval: 15_000,
  })

  const activeSessionQuery = useQuery({
    queryKey: activeSessionQueryKey,
    queryFn: () => workoutService.getActiveSessionSnapshot(),
    staleTime: 3_000,
    refetchInterval: 5_000,
  })

  const lastSummaryQuery = useQuery({
    queryKey: lastSummaryQueryKey,
    queryFn: () => workoutService.getLastSessionSummary(),
    staleTime: 15_000,
  })

  const updateExerciseMutation = useMutation({
    mutationFn: workoutService.updateExerciseStatus,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: workoutPlanQueryKey }),
        queryClient.invalidateQueries({ queryKey: ['progress'] }),
        queryClient.invalidateQueries({ queryKey: ['home', 'dashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['gamification', 'overview'] }),
        queryClient.invalidateQueries({ queryKey: ['ranking'] }),
        queryClient.invalidateQueries({ queryKey: ['notifications'] }),
      ])
    },
  })

  const createQuickWorkoutMutation = useMutation({
    mutationFn: (date?: string) => workoutService.createQuickWorkout({ date: date ?? selectedDate ?? undefined }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: workoutPlanQueryKey }),
        queryClient.invalidateQueries({ queryKey: activeSessionQueryKey }),
        queryClient.invalidateQueries({ queryKey: ['progress'] }),
        queryClient.invalidateQueries({ queryKey: ['home', 'dashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['ranking'] }),
        queryClient.invalidateQueries({ queryKey: ['notifications'] }),
      ])
    },
  })

  const uiState = useMemo(() => {
    if (planQuery.isPending) {
      return 'loading' as const
    }

    if (planQuery.isError) {
      return 'error' as const
    }

    if (!planQuery.data?.workouts.length) {
      return 'empty' as const
    }

    return 'ready' as const
  }, [planQuery.data?.workouts.length, planQuery.isError, planQuery.isPending])

  const data = planQuery.data
  const allWorkouts = data?.workouts ?? []
  const week = data?.week ?? []
  const selectedDate =
    selectedDateOverride ??
    (week.length ? week.find((day) => day.isToday)?.date ?? week[0].date : null)
  const selectedDay = week.find((day) => day.date === selectedDate) ?? null
  const selectedDateWorkouts = useMemo(() => {
    if (!selectedDate) {
      return []
    }

    return allWorkouts.filter((workout) => workout.date === selectedDate)
  }, [allWorkouts, selectedDate])

  const activeSession = activeSessionQuery.data ?? null
  const history = data?.history ?? []
  const exercises = useMemo(() => {
    if (!data) {
      return []
    }

    if (selectedDateWorkouts[0]?.id) {
      const selectedWorkout = selectedDateWorkouts[0]
      if (selectedWorkout.id === data.todayWorkout.workoutId) {
        return data.exercises
      }
    }

    return data.exercises
  }, [data, selectedDateWorkouts])

  const permissions = data?.permissions ?? {
    hasActivePersonal: false,
    canCreateQuickWorkout: true,
    canExecuteOnlyAssigned: false,
    canEditPlan: false,
  }

  const todayWorkout =
    data?.todayWorkout ?? {
      title: 'Nenhum treino planejado',
      durationMin: 0,
      calories: 0,
      stars: 0,
      progressPct: 0,
      completedCount: 0,
      totalCount: 0,
    }

  const hasWorkoutToday = Boolean(todayWorkout.workoutId || todayWorkout.durationMin > 0)
  const totalDurationMin = exercises.reduce((total, exercise) => total + exercise.durationMin, 0)
  const isStarted = Boolean(activeSession) || exercises.some((exercise) => exercise.status === 'current' || exercise.status === 'done')

  async function setCurrentExercise(id: string) {
    const exercise = exercises.find((item) => item.id === id)

    if (!exercise || exercise.status === 'done') {
      return
    }

    await updateExerciseMutation.mutateAsync({ id, status: 'current' })
  }

  async function toggleExerciseDone(id: string) {
    const exercise = exercises.find((item) => item.id === id)

    if (!exercise) {
      return
    }

    const nextStatus = exercise.status === 'done' ? 'upcoming' : 'done'
    await updateExerciseMutation.mutateAsync({ id, status: nextStatus })
  }

  async function createQuickWorkout(date?: string) {
    if (!permissions.canCreateQuickWorkout) {
      throw new Error('Criacao manual bloqueada: voce tem personal ativo com treinos atribuidos.')
    }

    await createQuickWorkoutMutation.mutateAsync(date)
  }

  function setSelectedDate(date: string) {
    setSelectedDateOverride(date)
  }

  async function retryLoad() {
    await Promise.all([
      planQuery.refetch(),
      activeSessionQuery.refetch(),
      lastSummaryQuery.refetch(),
    ])
  }

  return {
    uiState,
    allWorkouts,
    week,
    selectedDate,
    selectedDay,
    selectedDateWorkouts,
    hasWorkoutToday,
    exercises,
    permissions,
    history,
    activeSession,
    lastSummary: lastSummaryQuery.data ?? null,
    progressPct: todayWorkout.progressPct ?? 0,
    todayWorkout,
    totalDurationMin,
    isStarted,
    isUpdatingExercise: updateExerciseMutation.isPending,
    isCreatingQuickWorkout: createQuickWorkoutMutation.isPending,
    setSelectedDate,
    setCurrentExercise,
    toggleExerciseDone,
    createQuickWorkout,
    retryLoad,
  }
}
