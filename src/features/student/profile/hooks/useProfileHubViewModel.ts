import { useMemo } from 'react'

import { useProgressOverview } from '@/features/student/progress/hooks/useProgressOverview'
import { useStudentHub } from '@/features/student/hooks/useStudentHub'

import { useProfileSettings } from './useProfileSettings'
import { useStudentRelationships } from './useStudentRelationships'

function toIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function formatMemberSince(value: string) {
  const normalizedValue = value.includes('T') ? value : `${value}T00:00:00`
  const parsedDate = new Date(normalizedValue)

  if (Number.isNaN(parsedDate.getTime())) {
    return 'data indisponivel'
  }

  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(parsedDate)
}

function goalLabel(goal: 'lose_weight' | 'gain_muscle' | 'maintenance' | 'performance') {
  if (goal === 'lose_weight') {
    return 'Emagrecimento'
  }

  if (goal === 'gain_muscle') {
    return 'Ganho de massa'
  }

  if (goal === 'performance') {
    return 'Performance'
  }

  return 'Manutencao'
}

export function useProfileHubViewModel(enabledRelationships = true, enabledStudentContext = true) {
  const today = useMemo(() => toIsoDate(new Date()), [])
  const profileQuery = useProfileSettings()
  const studentHubQuery = useStudentHub(today, enabledStudentContext)
  const progressQuery = useProgressOverview('30d', enabledStudentContext)
  const relationshipsQuery = useStudentRelationships(enabledRelationships)

  const uiState = useMemo(() => {
    if (!enabledStudentContext) {
      if (profileQuery.uiState === 'loading') {
        return 'loading' as const
      }

      if (profileQuery.uiState === 'error') {
        return 'error' as const
      }

      return profileQuery.profile ? 'ready' as const : 'empty' as const
    }

    if (
      profileQuery.uiState === 'loading' ||
      studentHubQuery.uiState === 'loading' ||
      progressQuery.uiState === 'loading'
    ) {
      return 'loading' as const
    }

    if (
      profileQuery.uiState === 'error' ||
      studentHubQuery.uiState === 'error' ||
      progressQuery.uiState === 'error'
    ) {
      return 'error' as const
    }

    if (!profileQuery.profile || !studentHubQuery.dashboard || !progressQuery.overview) {
      return 'empty' as const
    }

    return 'ready' as const
  }, [
    profileQuery.profile,
    profileQuery.uiState,
    progressQuery.overview,
    progressQuery.uiState,
    studentHubQuery.dashboard,
    studentHubQuery.uiState,
    enabledStudentContext,
  ])

  const data = useMemo(() => {
    if (!profileQuery.profile) {
      return null
    }

    if (!enabledStudentContext) {
      const profile = profileQuery.profile

      return {
        profile,
        dashboard: null,
        progress: null,
        relationships: relationshipsQuery.overview,
        achievements: [],
        hero: {
          name: profile.name,
          avatarUrl: undefined,
          goalLabel: goalLabel(profile.goal),
          level: 0,
          stars: 0,
          streakDays: 0,
          headline: 'Centralize seus dados e preferências do app em um só lugar.',
        },
        account: {
          memberSinceLabel: formatMemberSince(today),
          cityLabel: `${profile.city}, ${profile.neighborhood}`,
          gym: profile.gym,
          supportCount: 0,
        },
        physicalSummary: null,
      }
    }

    if (!profileQuery.profile || !studentHubQuery.dashboard || !progressQuery.overview) {
      return null
    }

    const profile = profileQuery.profile
    const dashboard = studentHubQuery.dashboard
    const progress = progressQuery.overview
    const achievements = [...dashboard.achievements]
      .sort((left, right) => {
        if (left.status === 'unlocked' && right.status !== 'unlocked') {
          return -1
        }

        if (left.status !== 'unlocked' && right.status === 'unlocked') {
          return 1
        }

        return right.currentProgress / Math.max(right.targetProgress, 1) - left.currentProgress / Math.max(left.targetProgress, 1)
      })
      .slice(0, 4)

    return {
      profile,
      dashboard,
      progress,
      relationships: relationshipsQuery.overview,
      achievements,
      hero: {
        name: profile.name,
        avatarUrl: dashboard.profile.avatarUrl,
        goalLabel: goalLabel(profile.goal),
        level: dashboard.gamificationProfile.level,
        stars: dashboard.gamificationProfile.stars,
        streakDays: dashboard.gamificationProfile.streakDays,
        headline: dashboard.profile.headline,
      },
      account: {
        memberSinceLabel: formatMemberSince(dashboard.profile.memberSince),
        cityLabel: `${profile.city}, ${profile.neighborhood}`,
        gym: profile.gym,
        supportCount:
          (relationshipsQuery.overview?.personal ? 1 : 0) +
          (relationshipsQuery.overview?.nutritionist ? 1 : 0),
      },
      physicalSummary: {
        weightKg: progress.metrics.currentWeightKg,
        bmi: progress.metrics.bmi,
        bmiStatus: progress.bodyComposition.bmiStatus,
        heightCm: progress.bodyComposition.heightCm,
      },
    }
  }, [enabledStudentContext, profileQuery.profile, progressQuery.overview, relationshipsQuery.overview, studentHubQuery.dashboard, today])

  return {
    uiState,
    data,
    error: enabledStudentContext
      ? profileQuery.error ?? studentHubQuery.error ?? progressQuery.error ?? relationshipsQuery.error
      : profileQuery.error ?? relationshipsQuery.error,
    refresh: async () => {
      await Promise.all([
        profileQuery.refresh(),
        studentHubQuery.refresh(),
        progressQuery.refresh(),
        relationshipsQuery.refresh(),
      ])
    },
    saveProfile: profileQuery.saveProfile,
    isSaving: profileQuery.isSaving,
    sendInvite: relationshipsQuery.sendInvite,
    respondInvite: relationshipsQuery.respondInvite,
    isSendingInvite: relationshipsQuery.isSendingInvite,
    isRespondingInvite: relationshipsQuery.isRespondingInvite,
    relationshipsUiState: relationshipsQuery.uiState,
  }
}
