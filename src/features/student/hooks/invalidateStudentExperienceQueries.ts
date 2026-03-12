import type { QueryClient } from '@tanstack/react-query'

import { gamificationQueryKeys } from '@/features/student/gamification/hooks/queryKeys'
import { notificationsQueryKeys } from '@/features/student/notifications/hooks/queryKeys'
import { nutritionQueryKeys } from '@/features/student/nutrition/hooks/queryKeys'
import { profileQueryKeys } from '@/features/student/profile/hooks/queryKeys'
import { progressQueryKeys } from '@/features/student/progress/hooks/queryKeys'
import { rankingQueryKeys } from '@/features/student/ranking/hooks/queryKeys'

import { studentQueryKeys } from './queryKeys'

type InvalidateStudentExperienceOptions = {
  includeNutrition?: boolean
  includeProfile?: boolean
  includeLegacyHome?: boolean
}

export async function invalidateStudentExperienceQueries(
  queryClient: QueryClient,
  options: InvalidateStudentExperienceOptions = {},
) {
  const {
    includeNutrition = true,
    includeProfile = false,
    includeLegacyHome = true,
  } = options

  const invalidations = [
    queryClient.invalidateQueries({ queryKey: studentQueryKeys.root }),
    queryClient.invalidateQueries({ queryKey: progressQueryKeys.root }),
    queryClient.invalidateQueries({ queryKey: gamificationQueryKeys.root }),
    queryClient.invalidateQueries({ queryKey: rankingQueryKeys.root }),
    queryClient.invalidateQueries({ queryKey: notificationsQueryKeys.root }),
  ]

  if (includeNutrition) {
    invalidations.push(queryClient.invalidateQueries({ queryKey: nutritionQueryKeys.root }))
  }

  if (includeProfile) {
    invalidations.push(queryClient.invalidateQueries({ queryKey: profileQueryKeys.root }))
  }

  if (includeLegacyHome) {
    invalidations.push(queryClient.invalidateQueries({ queryKey: ['home'] }))
  }

  await Promise.all(invalidations)
}
