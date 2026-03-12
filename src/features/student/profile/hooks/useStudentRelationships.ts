import { useMemo } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { relationshipService } from '@/shared/services'

const studentRelationshipsQueryKey = ['relationships', 'me'] as const

export function useStudentRelationships(enabled = true) {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: studentRelationshipsQueryKey,
    queryFn: () => relationshipService.getMyRelationships(),
    enabled,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  })

  const inviteMutation = useMutation({
    mutationFn: (input: { codeOrId: string }) => relationshipService.inviteByCodeOrId(input),
    onSuccess: (overview) => {
      queryClient.setQueryData(studentRelationshipsQueryKey, overview)
    },
  })

  const respondMutation = useMutation({
    mutationFn: (input: { inviteId: string; action: 'accept' | 'reject' }) => relationshipService.respondToInvite(input),
    onSuccess: (overview) => {
      queryClient.setQueryData(studentRelationshipsQueryKey, overview)
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: ['workouts'] }),
        queryClient.invalidateQueries({ queryKey: ['nutrition'] }),
        queryClient.invalidateQueries({ queryKey: ['progress'] }),
      ])
    },
  })

  const uiState = useMemo(() => {
    if (!enabled) {
      return 'hidden' as const
    }

    if (query.isPending) {
      return 'loading' as const
    }

    if (query.isError) {
      return 'error' as const
    }

    if (!query.data) {
      return 'empty' as const
    }

    return 'ready' as const
  }, [enabled, query.data, query.isError, query.isPending])

  return {
    overview: query.data ?? null,
    uiState,
    error: query.error,
    refresh: query.refetch,
    sendInvite: inviteMutation.mutateAsync,
    respondInvite: respondMutation.mutateAsync,
    isSendingInvite: inviteMutation.isPending,
    isRespondingInvite: respondMutation.isPending,
  }
}
