import { useMemo } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { personalService } from '@/shared/services'
import type {
  CreatePersonalStudentInput,
  CreatePersonalWorkoutInput,
  DeactivatePersonalWorkoutInput,
  GrantPersonalAchievementInput,
  PersonalStudentAnamnesis,
  SendPersonalMotivationInput,
  UpdatePersonalWorkoutInput,
} from '@/shared/services/contracts/personal'

import { personalQueryKeys } from './queryKeys'

export type PersonalUiState = 'loading' | 'ready' | 'empty' | 'error'

export function usePersonalDashboard() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: personalQueryKeys.dashboard,
    queryFn: () => personalService.getDashboardOverview(),
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  })

  const createWorkoutMutation = useMutation({
    mutationFn: (input: CreatePersonalWorkoutInput) => personalService.createWorkout(input),
    onSuccess: async (dashboard) => {
      queryClient.setQueryData(personalQueryKeys.dashboard, dashboard)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['workouts'] }),
        queryClient.invalidateQueries({ queryKey: ['home', 'dashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['progress'] }),
        queryClient.invalidateQueries({ queryKey: ['notifications'] }),
      ])
    },
  })

  const updateWorkoutMutation = useMutation({
    mutationFn: (input: UpdatePersonalWorkoutInput) => personalService.updateWorkout(input),
    onSuccess: async (dashboard) => {
      queryClient.setQueryData(personalQueryKeys.dashboard, dashboard)
      await queryClient.invalidateQueries({ queryKey: ['workouts'] })
    },
  })

  const deactivateWorkoutMutation = useMutation({
    mutationFn: (input: DeactivatePersonalWorkoutInput) => personalService.deactivateWorkout(input),
    onSuccess: async (dashboard) => {
      queryClient.setQueryData(personalQueryKeys.dashboard, dashboard)
      await queryClient.invalidateQueries({ queryKey: ['workouts'] })
    },
  })

  const sendMotivationalMessageMutation = useMutation({
    mutationFn: (input: SendPersonalMotivationInput) => personalService.sendMotivationalMessage(input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['notifications'] }),
        queryClient.invalidateQueries({ queryKey: ['gamification', 'overview'] }),
      ])
    },
  })

  const grantSpecialAchievementMutation = useMutation({
    mutationFn: (input: GrantPersonalAchievementInput) => personalService.grantSpecialAchievement(input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['notifications'] }),
        queryClient.invalidateQueries({ queryKey: ['gamification', 'overview'] }),
      ])
    },
  })

  const updateMeasurementsRequestStatusMutation = useMutation({
    mutationFn: (input: { requestId: string; status: 'open' | 'accepted' | 'done' }) =>
      personalService.updateMeasurementsRequestStatus(input),
    onSuccess: async (dashboard) => {
      queryClient.setQueryData(personalQueryKeys.dashboard, dashboard)
      await queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const generateStudentInviteLinkMutation = useMutation({
    mutationFn: () => personalService.generateStudentInviteLink(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: personalQueryKeys.dashboard })
    },
  })

  const createStudentAccountMutation = useMutation({
    mutationFn: (input: CreatePersonalStudentInput) => personalService.createStudentAccount(input),
    onSuccess: async ({ dashboard }) => {
      queryClient.setQueryData(personalQueryKeys.dashboard, dashboard)
      await queryClient.invalidateQueries({ queryKey: personalQueryKeys.dashboard })
    },
  })

  const saveStudentAnamnesisMutation = useMutation({
    mutationFn: (input: { studentId: string; anamnesis: PersonalStudentAnamnesis }) =>
      personalService.saveStudentAnamnesis(input.studentId, input.anamnesis),
    onSuccess: async (dashboard) => {
      queryClient.setQueryData(personalQueryKeys.dashboard, dashboard)
      await queryClient.invalidateQueries({ queryKey: personalQueryKeys.dashboard })
    },
  })

  const uiState: PersonalUiState = useMemo(() => {
    if (query.isPending) {
      return 'loading'
    }

    if (query.isError) {
      return 'error'
    }

    if (!query.data) {
      return 'empty'
    }

    return 'ready'
  }, [query.data, query.isError, query.isPending])

  return {
    overview: query.data ?? null,
    uiState,
    error: query.error,
    refresh: query.refetch,
    createWorkout: createWorkoutMutation.mutateAsync,
    updateWorkout: updateWorkoutMutation.mutateAsync,
    deactivateWorkout: deactivateWorkoutMutation.mutateAsync,
    sendMotivationalMessage: sendMotivationalMessageMutation.mutateAsync,
    grantSpecialAchievement: grantSpecialAchievementMutation.mutateAsync,
    updateMeasurementsRequestStatus: updateMeasurementsRequestStatusMutation.mutateAsync,
    generateStudentInviteLink: generateStudentInviteLinkMutation.mutateAsync,
    createStudentAccount: createStudentAccountMutation.mutateAsync,
    saveStudentAnamnesis: saveStudentAnamnesisMutation.mutateAsync,
    getStudentAnamnesis: personalService.getStudentAnamnesis,
    getStudentWorkoutHistory: personalService.getStudentWorkoutHistory,
    isCreatingWorkout: createWorkoutMutation.isPending,
    isUpdatingWorkout: updateWorkoutMutation.isPending,
    isDeactivatingWorkout: deactivateWorkoutMutation.isPending,
    isSendingMotivationalMessage: sendMotivationalMessageMutation.isPending,
    isGrantingSpecialAchievement: grantSpecialAchievementMutation.isPending,
    isUpdatingMeasurementsRequestStatus: updateMeasurementsRequestStatusMutation.isPending,
    isGeneratingStudentInviteLink: generateStudentInviteLinkMutation.isPending,
    isCreatingStudentAccount: createStudentAccountMutation.isPending,
    isSavingStudentAnamnesis: saveStudentAnamnesisMutation.isPending,
  }
}
