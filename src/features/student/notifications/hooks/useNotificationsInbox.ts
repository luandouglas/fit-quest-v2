import { useMemo } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { invalidateStudentExperienceQueries } from '@/features/student/hooks/invalidateStudentExperienceQueries'
import { notificationsService, type NotificationsInbox } from '@/shared/services'

import { notificationsQueryKeys } from './queryKeys'

export type NotificationsUiState = 'loading' | 'ready' | 'empty' | 'error'

export function useNotificationsInbox() {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: notificationsQueryKeys.inbox,
    queryFn: () => notificationsService.getInbox(),
    staleTime: 0,
    refetchInterval: 10_000,
    refetchOnWindowFocus: true,
  })

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => notificationsService.markAsRead(notificationId),
    onSuccess: async (inbox) => {
      queryClient.setQueryData(notificationsQueryKeys.inbox, inbox)
      await invalidateStudentExperienceQueries(queryClient, { includeNutrition: false })
    },
  })

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationsService.markAllAsRead(),
    onSuccess: async (inbox) => {
      queryClient.setQueryData(notificationsQueryKeys.inbox, inbox)
      await invalidateStudentExperienceQueries(queryClient, { includeNutrition: false })
    },
  })

  const inbox = useMemo(() => query.data ?? null, [query.data])
  const uiState: NotificationsUiState = useMemo(() => {
    if (query.isPending) {
      return 'loading'
    }

    if (query.isError) {
      return 'error'
    }

    if (!inbox || inbox.items.length === 0) {
      return 'empty'
    }

    return 'ready'
  }, [inbox, query.isError, query.isPending])

  return {
    inbox,
    uiState,
    error: query.error,
    refresh: query.refetch,
    markAsRead: markAsReadMutation.mutateAsync,
    markAllAsRead: markAllAsReadMutation.mutateAsync,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
  }
}

export type { NotificationsInbox }
