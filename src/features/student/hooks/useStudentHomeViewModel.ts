import { useMemo } from 'react'

import type { FqTone, IconName } from '@/shared/ui'
import type {
  StudentDashboard,
  StudentQuickAction,
  StudentQuickActionStatus,
} from '@/shared/services/contracts/student'

type StudentHomeAlert = {
  id: string
  title: string
  description: string
  tone: FqTone
  icon: IconName
  actionLabel?: string
  actionRoute?: string
}

type StudentHomeChecklistItem = {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed'
  progressLabel: string
}

type StudentHomeMealItem = {
  id: string
  name: string
  status: 'pending' | 'completed' | 'skipped'
  scheduledAt: string
  rewardStars: number
}

type StudentHomeQuickAction = StudentQuickAction & {
  tone: FqTone
}

type StudentHomeWeeklySummary = {
  completionLabel: string
  workoutLabel: string
  nutritionLabel: string
  hydrationLabel: string
  rankingLabel: string
}

export type StudentHomeViewModel = {
  greeting: string
  salutation: string
  pendingActionsCount: number
  nextLevelXpRemaining: number
  nextLevelStarsEstimate: number
  completedMealsCount: number
  pendingMeals: StudentHomeMealItem[]
  checklist: StudentHomeChecklistItem[]
  alerts: StudentHomeAlert[]
  quickActions: StudentHomeQuickAction[]
  weeklySummary: StudentHomeWeeklySummary
}

function getGreetingByTime(date = new Date()) {
  const hour = date.getHours()

  if (hour < 12) {
    return 'Bom dia'
  }

  if (hour < 18) {
    return 'Boa tarde'
  }

  return 'Boa noite'
}

function getActionTone(status: StudentQuickActionStatus): FqTone {
  if (status === 'completed') {
    return 'success'
  }

  if (status === 'locked') {
    return 'neutral'
  }

  return 'primary'
}

export function useStudentHomeViewModel(dashboard: StudentDashboard | null): StudentHomeViewModel | null {
  return useMemo(() => {
    if (!dashboard) {
      return null
    }

    const { profile, dailyProgress, todayWorkout, cardioSession, nutritionPlan, waterProgress, gamificationProfile, rankingSummary, metrics, quickActions } =
      dashboard
    const greeting = getGreetingByTime()
    const completedMealsCount = nutritionPlan.meals.filter((meal) => meal.status === 'completed').length
    const pendingMeals = nutritionPlan.meals.filter((meal) => meal.status === 'pending')
    const pendingActionsCount = [
      todayWorkout?.status === 'completed',
      cardioSession?.status === 'completed',
      nutritionPlan.status === 'completed',
      waterProgress.status === 'completed',
    ].filter(Boolean).length
    const remainingActions = Math.max(4 - pendingActionsCount, 0)
    const nextLevelXpRemaining = Math.max(gamificationProfile.nextLevelXp - gamificationProfile.currentLevelXp, 0)
    const nextLevelStarsEstimate = Math.max(Math.ceil(nextLevelXpRemaining / 20), 0)

    const checklist: StudentHomeChecklistItem[] = [
      {
        id: 'checklist-workout',
        title: todayWorkout?.title ?? 'Treino do dia',
        description: todayWorkout?.coachNote ?? 'Sessão principal planejada para hoje.',
        status:
          todayWorkout?.status === 'completed'
            ? 'completed'
            : todayWorkout?.status === 'in_progress'
              ? 'in_progress'
              : 'pending',
        progressLabel: todayWorkout ? `${todayWorkout.completionPct}% concluído` : 'Sem treino agendado',
      },
      {
        id: 'checklist-nutrition',
        title: 'Plano alimentar',
        description:
          pendingMeals.length > 0
            ? `${pendingMeals.length} refeição(ões) ainda aguardam registro.`
            : 'Todas as refeições do dia foram registradas.',
        status:
          nutritionPlan.status === 'completed'
            ? 'completed'
            : nutritionPlan.status === 'in_progress'
              ? 'in_progress'
              : 'pending',
        progressLabel: `${completedMealsCount}/${nutritionPlan.meals.length} refeições`,
      },
      {
        id: 'checklist-water',
        title: 'Meta de água',
        description:
          waterProgress.remainingMl > 0
            ? `Faltam ${waterProgress.remainingMl} ml para bater sua meta.`
            : 'Meta de hidratação concluída hoje.',
        status:
          waterProgress.status === 'completed'
            ? 'completed'
            : waterProgress.status === 'in_progress'
              ? 'in_progress'
              : 'pending',
        progressLabel: `${waterProgress.consumedMl}/${waterProgress.targetMl} ml`,
      },
      {
        id: 'checklist-cardio',
        title: cardioSession?.title ?? 'Cardio leve',
        description:
          cardioSession?.status === 'completed'
            ? 'Cardio finalizado e contabilizado no progresso.'
            : 'Sessão complementar para manter consistência e gasto calórico.',
        status:
          cardioSession?.status === 'completed'
            ? 'completed'
            : cardioSession?.status === 'in_progress'
              ? 'in_progress'
              : 'pending',
        progressLabel: cardioSession
          ? `${cardioSession.completedDurationMin}/${cardioSession.goalDurationMin} min`
          : 'Sem cardio obrigatório',
      },
    ]

    const alerts: StudentHomeAlert[] = []

    if (todayWorkout && todayWorkout.status === 'scheduled') {
      alerts.push({
        id: 'alert-workout',
        title: 'Treino de hoje ainda não iniciado',
        description: `${todayWorkout.title} está pronto para execução.`,
        tone: 'warning',
        icon: 'dumbbell',
        actionLabel: 'Iniciar treino',
        actionRoute: '/tabs/workouts/session',
      })
    }

    if (waterProgress.remainingMl > 0) {
      alerts.push({
        id: 'alert-water',
        title: `Faltam ${waterProgress.remainingMl} ml para sua meta`,
        description: 'Registrar água agora ajuda a fechar o dia sem acúmulo no fim da noite.',
        tone: waterProgress.remainingMl <= 600 ? 'secondary' : 'warning',
        icon: 'flask',
        actionLabel: 'Adicionar água',
        actionRoute: '/tabs/nutrition',
      })
    }

    const lunchMeal = nutritionPlan.meals.find((meal) => meal.name.toLowerCase().includes('almoco'))

    if (lunchMeal && lunchMeal.status === 'pending') {
      alerts.push({
        id: 'alert-lunch',
        title: 'Almoço ainda não registrado',
        description: 'Atualize o almoço para não perder aderência nutricional.',
        tone: 'warning',
        icon: 'utensils',
        actionLabel: 'Registrar refeição',
        actionRoute: '/tabs/nutrition',
      })
    }

    if (remainingActions > 0) {
      alerts.push({
        id: 'alert-day-close',
        title: `Faltam ${remainingActions} ação(ões) para fechar o dia`,
        description: 'Concluir os blocos pendentes aumenta streak, XP e estrelas.',
        tone: 'primary',
        icon: 'target',
      })
    }

    if (nextLevelStarsEstimate > 0) {
      alerts.push({
        id: 'alert-level',
        title: `Mais ${nextLevelStarsEstimate} estrelas para subir de nível`,
        description: `Você está a ${nextLevelXpRemaining} XP do próximo nível.`,
        tone: 'success',
        icon: 'star',
        actionLabel: 'Ver gamificação',
        actionRoute: '/tabs/gamification',
      })
    }

    return {
      greeting,
      salutation: `${greeting}, ${profile.firstName}`,
      pendingActionsCount: remainingActions,
      nextLevelXpRemaining,
      nextLevelStarsEstimate,
      completedMealsCount,
      pendingMeals,
      checklist,
      alerts,
      quickActions: quickActions.map((action) => ({
        ...action,
        tone: getActionTone(action.status),
      })),
      weeklySummary: {
        completionLabel: `${dailyProgress.completionPct}% do dia concluído`,
        workoutLabel: `${metrics.workoutsCompletedMonth} treinos no mês`,
        nutritionLabel: `${metrics.nutritionAdherencePct}% de aderência`,
        hydrationLabel: `${metrics.averageWaterMl} ml/dia em média`,
        rankingLabel: `#${rankingSummary.position} no ranking ${rankingSummary.period}`,
      },
    }
  }, [dashboard])
}
