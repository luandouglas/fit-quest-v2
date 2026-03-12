import { useMemo } from 'react'

import { useStudentHub } from '@/features/student/hooks/useStudentHub'
import type { Achievement, RankingSummary, StudentDashboard } from '@/shared/services/contracts/student'

import { useGamificationOverview } from './useGamificationOverview'

type GamificationViewState = 'loading' | 'ready' | 'empty' | 'error'

export type GamificationObjectiveItem = {
  id: string
  title: string
  description: string
  progressPct: number
  progressLabel: string
  rewardLabel: string
  tone: 'primary' | 'secondary' | 'success' | 'warning'
}

export type GamificationRewardItem = {
  id: string
  title: string
  description: string
  status: 'earned' | 'next'
}

export type GamificationAchievementCardItem = {
  id: string
  title: string
  description: string
  icon: 'trophy' | 'star' | 'flame' | 'target'
  unlocked: boolean
  progressPct: number
  progressLabel: string
  rewardLabel?: string
}

function toIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)))
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function resolveTrendLabel(ranking: RankingSummary | null) {
  if (!ranking) {
    return 'Ranking sincronizando'
  }

  if (ranking.trend === 'up') {
    return 'Subindo no ranking'
  }

  if (ranking.trend === 'down') {
    return 'Perdeu ritmo'
  }

  return 'Posicao estavel'
}

function buildFeedback(
  dashboard: StudentDashboard | null,
  nextLevelRemaining: number,
  ranking: RankingSummary | null,
) {
  const feedback: string[] = []

  if (dashboard) {
    if (dashboard.todayWorkout?.status === 'scheduled') {
      feedback.push('Seu treino de hoje ainda vale estrelas e fortalece o streak.')
    }

    if (dashboard.waterProgress.remainingMl > 0) {
      feedback.push(`Faltam ${dashboard.waterProgress.remainingMl} ml para bater a meta de agua.`)
    }

    const pendingMeals = dashboard.nutritionPlan.meals.filter((meal) => meal.status === 'pending').length

    if (pendingMeals > 0) {
      feedback.push(
        pendingMeals === 1
          ? 'Falta registrar 1 refeicao para fechar sua aderencia alimentar.'
          : `Faltam ${pendingMeals} refeicoes para completar o plano do dia.`,
      )
    }
  }

  if (ranking && ranking.gapToNext > 0) {
    feedback.push(`${ranking.gapToNext} pontos separam voce da proxima posicao no ranking.`)
  }

  if (nextLevelRemaining > 0) {
    feedback.push(`Mais ${nextLevelRemaining} XP para subir de nivel.`)
  }

  return feedback.slice(0, 4)
}

function buildAchievements(dashboard: StudentDashboard | null) {
  const achievements = dashboard?.achievements ?? []
  const sorted = [...achievements].sort((left, right) => {
    const leftRatio = left.targetProgress > 0 ? left.currentProgress / left.targetProgress : 0
    const rightRatio = right.targetProgress > 0 ? right.currentProgress / right.targetProgress : 0

    if (left.status === 'unlocked' && right.status !== 'unlocked') {
      return -1
    }

    if (left.status !== 'unlocked' && right.status === 'unlocked') {
      return 1
    }

    return rightRatio - leftRatio
  })

  const toCardItem = (achievement: Achievement): GamificationAchievementCardItem => ({
    id: achievement.id,
    title: achievement.title,
    description: achievement.description,
    icon: achievement.icon,
    unlocked: achievement.status === 'unlocked',
    progressPct: clampPercent((achievement.currentProgress / Math.max(achievement.targetProgress, 1)) * 100),
    progressLabel:
      achievement.status === 'unlocked'
        ? 'Conquista liberada'
        : `${achievement.currentProgress}/${achievement.targetProgress}`,
    rewardLabel: `${achievement.rewardStars} estrelas + ${achievement.rewardXp} XP`,
  })

  return {
    unlocked: sorted.filter((achievement) => achievement.status === 'unlocked').slice(0, 4).map(toCardItem),
    upcoming: sorted.filter((achievement) => achievement.status !== 'unlocked').slice(0, 4).map(toCardItem),
  }
}

function buildRewards(
  dashboard: StudentDashboard | null,
  ranking: RankingSummary | null,
  nextLevelRemaining: number,
) {
  const achievements = dashboard?.achievements ?? []
  const earned = achievements
    .filter((achievement) => achievement.status === 'unlocked')
    .slice(0, 3)
    .map<GamificationRewardItem>((achievement) => ({
      id: `earned-${achievement.id}`,
      title: achievement.title,
      description: `${achievement.rewardStars} estrelas simbolicas e ${achievement.rewardXp} XP acumulados.`,
      status: 'earned',
    }))

  const next = achievements
    .filter((achievement) => achievement.status !== 'unlocked')
    .slice(0, 2)
    .map<GamificationRewardItem>((achievement) => ({
      id: `next-${achievement.id}`,
      title: achievement.title,
      description: `${achievement.currentProgress}/${achievement.targetProgress} para liberar ${achievement.rewardStars} estrelas.`,
      status: 'next',
    }))

  if (ranking) {
    next.unshift({
      id: 'ranking-league',
      title: `Liga ${ranking.league}`,
      description:
        ranking.gapToNext > 0
          ? `Mais ${ranking.gapToNext} pontos para pressionar a proxima posicao.`
          : 'Voce esta no topo da faixa atual.',
      status: 'next',
    })
  }

  next.push({
    id: 'next-level',
    title: 'Proximo nivel',
    description:
      nextLevelRemaining > 0
        ? `Mais ${nextLevelRemaining} XP para liberar o proximo marco do perfil.`
        : 'Nivel pronto para upgrade.',
    status: 'next',
  })

  return {
    earned: earned.slice(0, 3),
    next: next.slice(0, 3),
  }
}

export function useGamificationViewModel() {
  const today = useMemo(() => toIsoDate(new Date()), [])
  const overviewQuery = useGamificationOverview()
  const studentHubQuery = useStudentHub(today)

  const viewState: GamificationViewState = useMemo(() => {
    if (overviewQuery.uiState === 'loading' || studentHubQuery.uiState === 'loading') {
      return 'loading'
    }

    if (overviewQuery.uiState === 'error') {
      return 'error'
    }

    if (!overviewQuery.overview) {
      return 'empty'
    }

    return 'ready'
  }, [overviewQuery.overview, overviewQuery.uiState, studentHubQuery.uiState])

  const dashboard = studentHubQuery.dashboard ?? null
  const ranking = dashboard?.rankingSummary ?? null
  const nextLevelRemaining = Math.max(
    (overviewQuery.overview?.nextLevelXp ?? 0) - (overviewQuery.overview?.currentLevelXp ?? 0),
    0,
  )

  const data = useMemo(() => {
    if (!overviewQuery.overview) {
      return null
    }

    const overview = overviewQuery.overview
    const completedDailyMissions = overview.dailyMissions.filter((mission) => mission.completed).length
    const completedWeeklyMissions = overview.weeklyMissions.filter((mission) => mission.completed).length
    const pendingObjectives: GamificationObjectiveItem[] = [
      ...overview.dailyMissions
        .filter((mission) => !mission.completed)
        .slice(0, 2)
        .map((mission) => ({
          id: mission.id,
          title: mission.title,
          description: mission.description,
          progressPct: clampPercent((mission.current / Math.max(mission.target, 1)) * 100),
          progressLabel: `${mission.current}/${mission.target}`,
          rewardLabel: `${mission.rewardXp} XP`,
          tone: 'primary' as const,
        })),
      ...overview.weeklyMissions
        .filter((mission) => !mission.completed)
        .slice(0, 2)
        .map((mission) => ({
          id: mission.id,
          title: mission.title,
          description: mission.description,
          progressPct: clampPercent((mission.current / Math.max(mission.target, 1)) * 100),
          progressLabel: `${mission.current}/${mission.target}`,
          rewardLabel: `${mission.rewardXp} XP`,
          tone: 'secondary' as const,
        })),
    ]

    if (pendingObjectives.length < 4) {
      pendingObjectives.push({
        id: 'next-level',
        title: 'Subir de nivel',
        description: 'Seu proximo salto reforca status, ranking e leitura de progresso.',
        progressPct: clampPercent((overview.currentLevelXp / Math.max(overview.nextLevelXp, 1)) * 100),
        progressLabel: `${overview.currentLevelXp}/${overview.nextLevelXp} XP`,
        rewardLabel: nextLevelRemaining > 0 ? `Faltam ${nextLevelRemaining} XP` : 'Nivel pronto',
        tone: 'warning',
      })
    }

    if (pendingObjectives.length < 4 && ranking) {
      pendingObjectives.push({
        id: 'ranking',
        title: 'Pressionar ranking',
        description: `Liga ${ranking.league} com ${ranking.points} pontos acumulados no periodo.`,
        progressPct: clampPercent(
          ((ranking.totalParticipants - ranking.position + 1) / Math.max(ranking.totalParticipants, 1)) * 100,
        ),
        progressLabel: `${ranking.position}/${ranking.totalParticipants}`,
        rewardLabel: ranking.gapToNext > 0 ? `${ranking.gapToNext} pts para subir` : 'Topo pressionado',
        tone: 'success',
      })
    }

    const achievements = buildAchievements(dashboard)
    const rewards = buildRewards(dashboard, ranking, nextLevelRemaining)
    const feedback = buildFeedback(dashboard, nextLevelRemaining, ranking)

    const ledgerTimeline = overview.xpLedger.slice(0, 6).map((entry) => {
      const tone =
        entry.eventType === 'mission'
          ? 'success'
          : entry.eventType === 'bonus'
            ? 'secondary'
            : entry.eventType === 'hydration'
              ? 'primary'
              : 'neutral'

      return {
        id: entry.id,
        title: `${entry.title} (+${entry.xp} XP)`,
        description: entry.description,
        time: formatDateTime(entry.occurredAt),
        tone: tone as 'success' | 'secondary' | 'primary' | 'neutral',
      }
    })

    return {
      overview,
      ranking,
      stars: dashboard?.gamificationProfile.stars ?? 0,
      streakDays: dashboard?.gamificationProfile.streakDays ?? overview.weeklyStreak,
      completedDailyMissions,
      completedWeeklyMissions,
      nextLevelRemaining,
      pendingObjectives: pendingObjectives.slice(0, 4),
      achievements,
      rewards,
      feedback,
      trendLabel: resolveTrendLabel(ranking),
      ledgerTimeline,
    }
  }, [dashboard, nextLevelRemaining, overviewQuery.overview, ranking])

  return {
    data,
    dashboard,
    viewState,
    isDashboardReady: studentHubQuery.uiState === 'ready' && !!dashboard,
    refresh: async () => {
      await Promise.all([overviewQuery.refresh(), studentHubQuery.refresh()])
    },
    error: overviewQuery.error ?? studentHubQuery.error,
    registerWater: studentHubQuery.registerWater,
    isRegisterWaterPending: studentHubQuery.isRegisterWaterPending,
  }
}
