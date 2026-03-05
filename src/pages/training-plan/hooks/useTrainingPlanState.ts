import { useMemo, useState } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { workoutService, type WorkoutPlanSnapshot } from '@/shared/services'

const workoutPlanQueryKey = ['workouts', 'plan'] as const
const emptyExercises: WorkoutPlanSnapshot['exercises'] = []
const emptyWeek: WorkoutPlanSnapshot['week'] = []
const emptyPermissions: WorkoutPlanSnapshot['permissions'] = {
  hasActivePersonal: false,
  canCreateQuickWorkout: true,
  canExecuteOnlyAssigned: false,
  canEditPlan: true,
}

export function useTrainingPlanState() {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: workoutPlanQueryKey,
    queryFn: () => workoutService.getPlanSnapshot(),
    staleTime: 10_000,
    refetchInterval: 15_000,
  })

  const [selectedDateOverride, setSelectedDateOverride] = useState<string | null>(null)

  const updateExerciseMutation = useMutation({
    mutationFn: (input: { id: string; status: WorkoutPlanSnapshot['exercises'][number]['status'] }) =>
      workoutService.updateExerciseStatus(input),
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
    mutationFn: () => workoutService.createQuickWorkout({ date: selectedDate ?? undefined }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: workoutPlanQueryKey }),
        queryClient.invalidateQueries({ queryKey: ['progress'] }),
        queryClient.invalidateQueries({ queryKey: ['home', 'dashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['ranking'] }),
        queryClient.invalidateQueries({ queryKey: ['notifications'] }),
      ])
    },
  })

  const uiState = useMemo(() => {
    if (query.isPending) {
      return 'loading' as const
    }

    if (query.isError) {
      return 'error' as const
    }

    if (!query.data?.workouts.length) {
      return 'empty' as const
    }

    return 'ready' as const
  }, [query.data?.workouts.length, query.isError, query.isPending])

  const data = query.data
  const allWorkouts = data?.workouts ?? []
  const week = data?.week ?? emptyWeek
  const selectedDate =
    selectedDateOverride ??
    (week.length ? week.find((day) => day.isToday)?.date ?? week[0].date : null)
  const selectedDay = week.find((day) => day.date === selectedDate) ?? null

  const selectedDateWorkouts = useMemo(() => {
    if (!data || !selectedDate) {
      return []
    }

    return data.workouts.filter((workout) => workout.date === selectedDate)
  }, [data, selectedDate])

  const hasWorkoutToday = Boolean(data?.todayWorkout.title && data.todayWorkout.durationMin > 0)
  const exercises = useMemo(() => data?.exercises ?? emptyExercises, [data?.exercises])
  const permissions = data?.permissions ?? emptyPermissions
  const activeSession = workoutService.getActiveSessionSnapshot()
  const progressPct = data?.todayWorkout.progressPct ?? 0
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

  const totalDurationMin = useMemo(
    () => exercises.reduce((totalValue, exercise) => totalValue + exercise.durationMin, 0),
    [exercises],
  )

  const isStarted = useMemo(
    () => exercises.some((exercise) => exercise.status === 'current' || exercise.status === 'done'),
    [exercises],
  )

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

  async function createQuickWorkout() {
    if (!permissions.canCreateQuickWorkout) {
      throw new Error('Criacao manual bloqueada: voce tem personal ativo com treinos atribuidos.')
    }

    await createQuickWorkoutMutation.mutateAsync()
  }

  function setSelectedDate(date: string) {
    setSelectedDateOverride(date)
  }

  async function retryLoad() {
    await query.refetch()
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
    activeSession,
    progressPct,
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
