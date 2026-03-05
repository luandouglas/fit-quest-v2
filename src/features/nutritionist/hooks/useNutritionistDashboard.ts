import { useMemo } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { nutritionistService } from '@/shared/services'
import type {
  CreateNutritionistDietInput,
  GrantNutritionistAchievementInput,
  SendNutritionistMotivationInput,
} from '@/shared/services/contracts/nutritionist'
import type { BodyMeasurements } from '@/shared/services/contracts/progress'

import { nutritionistQueryKeys } from './queryKeys'

export type NutritionistUiState = 'loading' | 'ready' | 'empty' | 'error'

export function useNutritionistDashboard() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: nutritionistQueryKeys.dashboard,
    queryFn: () => nutritionistService.getDashboardOverview(),
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  })

  const createDietMutation = useMutation({
    mutationFn: (input: CreateNutritionistDietInput) => nutritionistService.createDiet(input),
    onSuccess: async (dashboard) => {
      queryClient.setQueryData(nutritionistQueryKeys.dashboard, dashboard)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['nutrition'] }),
        queryClient.invalidateQueries({ queryKey: ['home', 'dashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['progress'] }),
        queryClient.invalidateQueries({ queryKey: ['gamification', 'overview'] }),
      ])
    },
  })

  const reviewWeightMutation = useMutation({
    mutationFn: (input: { studentId: string; targetLogId: string; weightKg: number; comment: string }) =>
      nutritionistService.reviewStudentWeight(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['progress'] })
    },
  })

  const reviewMeasurementsMutation = useMutation({
    mutationFn: (input: { studentId: string; targetLogId: string; measurements: BodyMeasurements; comment: string }) =>
      nutritionistService.reviewStudentMeasurements(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['progress'] })
    },
  })

  const sendMotivationalMessageMutation = useMutation({
    mutationFn: (input: SendNutritionistMotivationInput) => nutritionistService.sendMotivationalMessage(input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['notifications'] }),
        queryClient.invalidateQueries({ queryKey: ['gamification', 'overview'] }),
      ])
    },
  })

  const grantSpecialAchievementMutation = useMutation({
    mutationFn: (input: GrantNutritionistAchievementInput) => nutritionistService.grantSpecialAchievement(input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['notifications'] }),
        queryClient.invalidateQueries({ queryKey: ['gamification', 'overview'] }),
      ])
    },
  })

  const updateMeasurementsRequestStatusMutation = useMutation({
    mutationFn: (input: { requestId: string; status: 'open' | 'accepted' | 'done' }) =>
      nutritionistService.updateMeasurementsRequestStatus(input),
    onSuccess: async (dashboard) => {
      queryClient.setQueryData(nutritionistQueryKeys.dashboard, dashboard)
      await queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const uiState: NutritionistUiState = useMemo(() => {
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
    createDiet: createDietMutation.mutateAsync,
    getStudentProgress: nutritionistService.getStudentProgress,
    reviewStudentWeight: reviewWeightMutation.mutateAsync,
    reviewStudentMeasurements: reviewMeasurementsMutation.mutateAsync,
    sendMotivationalMessage: sendMotivationalMessageMutation.mutateAsync,
    grantSpecialAchievement: grantSpecialAchievementMutation.mutateAsync,
    updateMeasurementsRequestStatus: updateMeasurementsRequestStatusMutation.mutateAsync,
    isCreatingDiet: createDietMutation.isPending,
    isReviewingWeight: reviewWeightMutation.isPending,
    isReviewingMeasurements: reviewMeasurementsMutation.isPending,
    isSendingMotivationalMessage: sendMotivationalMessageMutation.isPending,
    isGrantingSpecialAchievement: grantSpecialAchievementMutation.isPending,
    isUpdatingMeasurementsRequestStatus: updateMeasurementsRequestStatusMutation.isPending,
  }
}
