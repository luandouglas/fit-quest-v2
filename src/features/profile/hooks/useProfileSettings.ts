import { useMemo } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useAuth } from '@/shared/hooks'
import { profileService } from '@/shared/services'
import type { UpdateProfilePayload } from '@/shared/services/contracts/profile'

import { profileQueryKeys } from './queryKeys'

export type ProfileUiState = 'loading' | 'ready' | 'empty' | 'error'

export function useProfileSettings() {
  const queryClient = useQueryClient()
  const { updateUser } = useAuth()

  const query = useQuery({
    queryKey: profileQueryKeys.settings,
    queryFn: () => profileService.getProfile(),
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  })

  const updateProfileMutation = useMutation({
    mutationFn: (payload: UpdateProfilePayload) => profileService.updateProfile(payload),
    onSuccess: async (profile) => {
      updateUser({ name: profile.name })

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: profileQueryKeys.root }),
        queryClient.invalidateQueries({ queryKey: ['home', 'dashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['nutrition'] }),
        queryClient.invalidateQueries({ queryKey: ['progress'] }),
        queryClient.invalidateQueries({ queryKey: ['gamification'] }),
        queryClient.invalidateQueries({ queryKey: ['ranking'] }),
        queryClient.invalidateQueries({ queryKey: ['notifications'] }),
      ])
    },
  })

  const uiState: ProfileUiState = useMemo(() => {
    if (query.isPending) {
      return 'loading'
    }

    if (query.isError) {
      return 'error'
    }

    return query.data ? 'ready' : 'empty'
  }, [query.data, query.isError, query.isPending])

  return {
    profile: query.data ?? null,
    uiState,
    error: query.error,
    refresh: query.refetch,
    saveProfile: updateProfileMutation.mutateAsync,
    isSaving: updateProfileMutation.isPending,
  }
}
