import { useMemo } from 'react'

import { useStudentHub } from '@/features/student/hooks/useStudentHub'
import type {
  ProgressBodyComposition,
  BodyMeasurements,
  ProgressComparisonMetric,
  ProgressRange,
} from '@/shared/services/contracts/progress'

import { useProgressOverview } from './useProgressOverview'

export type ProgressViewState = 'loading' | 'ready' | 'empty' | 'error'

export type ProgressAnswerItem = {
  id: string
  label: string
  value: string
  helper: string
  tone: 'success' | 'secondary' | 'warning'
}

export type ProgressComparisonCardItem = {
  id: string
  title: string
  currentLabel: string
  previousLabel: string
  deltaLabel: string
  tone: 'success' | 'secondary' | 'warning'
}

export type ProgressMeasurementItem = {
  id: keyof BodyMeasurements
  label: string
  currentLabel: string
  deltaLabel: string
}

function toIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function formatSigned(value: number, suffix = '') {
  if (value === 0) {
    return `0${suffix}`
  }

  return `${value > 0 ? '+' : ''}${value}${suffix}`
}

function formatComparison(metric: ProgressComparisonMetric, suffix = '') {
  const tone = metric.trend === 'up' ? 'success' : metric.trend === 'down' ? 'warning' : 'secondary'
  return {
    currentLabel: `${metric.current}${suffix}`,
    previousLabel: `${metric.previous}${suffix}`,
    deltaLabel: metric.previous === 0 && metric.current > 0 ? 'Novo ganho no periodo' : formatSigned(metric.deltaPct, '%'),
    tone: tone as 'success' | 'secondary' | 'warning',
  }
}

function resolveBmiLabel(bmiStatus: ProgressBodyComposition['bmiStatus']) {
  if (bmiStatus === 'healthy') {
    return 'Faixa saudavel'
  }

  if (bmiStatus === 'underweight') {
    return 'Abaixo da faixa'
  }

  if (bmiStatus === 'overweight') {
    return 'Acima da faixa'
  }

  return 'Faixa de obesidade'
}

function buildMeasurements(bodyComposition: ProgressBodyComposition): ProgressMeasurementItem[] {
  if (!bodyComposition.latestMeasurements) {
    return []
  }

  const previous = bodyComposition.previousMeasurements
  const labels: Record<keyof NonNullable<ProgressBodyComposition['latestMeasurements']>, string> = {
    chestCm: 'Peito',
    waistCm: 'Cintura',
    hipsCm: 'Quadril',
    armCm: 'Braco',
    thighCm: 'Coxa',
  }

  return Object.entries(bodyComposition.latestMeasurements).map(([key, value]) => {
    const typedKey = key as keyof NonNullable<ProgressBodyComposition['latestMeasurements']>
    const delta = previous ? Number((value - previous[typedKey]).toFixed(1)) : null

    return {
      id: typedKey,
      label: labels[typedKey],
      currentLabel: `${value} cm`,
      deltaLabel: delta === null ? 'Sem comparativo' : `${delta > 0 ? '+' : ''}${delta} cm`,
    }
  })
}

export function useProgressViewModel(range: ProgressRange) {
  const today = useMemo(() => toIsoDate(new Date()), [])
  const progressQuery = useProgressOverview(range)
  const studentHubQuery = useStudentHub(today)

  const viewState: ProgressViewState = useMemo(() => {
    if (progressQuery.uiState === 'loading') {
      return 'loading'
    }

    if (progressQuery.uiState === 'error') {
      return 'error'
    }

    if (!progressQuery.overview) {
      return 'empty'
    }

    return 'ready'
  }, [progressQuery.overview, progressQuery.uiState])

  const dashboard = studentHubQuery.dashboard ?? null

  const data = useMemo(() => {
    if (!progressQuery.overview) {
      return null
    }

    const overview = progressQuery.overview
    const stars = dashboard?.gamificationProfile.stars ?? 0
    const level = dashboard?.gamificationProfile.level ?? 0
    const nextLevelRemaining = dashboard
      ? Math.max(dashboard.gamificationProfile.nextLevelXp - dashboard.gamificationProfile.currentLevelXp, 0)
      : 0

    const weeklyConsistencyGain =
      (overview.comparisons.weekly.workouts.trend === 'up' ? 1 : 0) +
      (overview.comparisons.weekly.nutritionConsistencyPct.trend === 'up' ? 1 : 0) +
      (overview.comparisons.weekly.waterAdherencePct.trend === 'up' ? 1 : 0)

    const answers: ProgressAnswerItem[] = [
      {
        id: 'evolution',
        label: 'Estou evoluindo?',
        value:
          overview.comparisons.monthly.activeDays.trend === 'up'
            ? 'Sim, voce esta acumulando mais dias ativos.'
            : 'Seu ritmo esta estabilizado.',
        helper: `${overview.monthSummary.activeDays} dias ativos no mes`,
        tone: overview.comparisons.monthly.activeDays.trend === 'down' ? 'warning' : 'success',
      },
      {
        id: 'consistency',
        label: 'Fui mais consistente?',
        value:
          weeklyConsistencyGain >= 2
            ? 'Sim, a consistencia semanal melhorou.'
            : 'Ainda ha margem para consolidar rotina.',
        helper: `Agua ${overview.weeklySummary.waterAdherencePct}% | Nutricao ${overview.weeklySummary.nutritionConsistencyPct}%`,
        tone: weeklyConsistencyGain >= 2 ? 'success' : 'warning',
      },
      {
        id: 'performance',
        label: 'Meu desempenho esta melhorando?',
        value:
          overview.comparisons.monthly.trainingMin.trend === 'up' || overview.comparisons.monthly.cardioDistanceKm.trend === 'up'
            ? 'Seu volume de treino e cardio subiu.'
            : 'Seu volume esta estavel no periodo.',
        helper: `${overview.monthSummary.totalTrainingMin} min e ${overview.monthSummary.totalRunKm.toFixed(1)} km no mes`,
        tone:
          overview.comparisons.monthly.trainingMin.trend === 'down' &&
          overview.comparisons.monthly.cardioDistanceKm.trend === 'down'
            ? 'warning'
            : 'success',
      },
      {
        id: 'level',
        label: 'Meu nivel esta avancando?',
        value: level > 0 ? `Nivel ${level} ativo` : 'Gamificacao sincronizando',
        helper: level > 0 ? `${stars} estrelas acumuladas e ${nextLevelRemaining} XP para o proximo nivel` : 'Aguardando dados do perfil gamificado',
        tone: stars > 0 ? 'secondary' : 'warning',
      },
    ]

    const comparisonCards: ProgressComparisonCardItem[] = [
      {
        id: 'weekly-workouts',
        title: 'Treinos na semana',
        ...formatComparison(overview.comparisons.weekly.workouts),
      },
      {
        id: 'weekly-cardio',
        title: 'Cardio na semana',
        ...formatComparison(overview.comparisons.weekly.cardioSessions),
      },
      {
        id: 'weekly-nutrition',
        title: 'Constancia alimentar',
        ...formatComparison(overview.comparisons.weekly.nutritionConsistencyPct, '%'),
      },
      {
        id: 'weekly-water',
        title: 'Meta de agua',
        ...formatComparison(overview.comparisons.weekly.waterAdherencePct, '%'),
      },
      {
        id: 'monthly-training',
        title: 'Minutos no mes',
        ...formatComparison(overview.comparisons.monthly.trainingMin, ' min'),
      },
      {
        id: 'monthly-cardio-distance',
        title: 'Distancia no mes',
        ...formatComparison(overview.comparisons.monthly.cardioDistanceKm, ' km'),
      },
    ]

    const heroFeedback = [
      ...overview.insights,
      nextLevelRemaining > 0 ? `Mais ${nextLevelRemaining} XP para subir de nivel.` : 'Proximo nivel pronto para virar.',
    ].slice(0, 4)

    const activityWindow = overview.chart.slice(-14)
    const measurementItems = buildMeasurements(overview.bodyComposition)

    const maxDuration = Math.max(...activityWindow.map((point) => point.durationMin), 1)
    const activityPoints = activityWindow.map((point) => ({
      ...point,
      durationPct: Math.max(10, Math.round((point.durationMin / maxDuration) * 100)),
      label: new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(new Date(`${point.date}T00:00:00`)),
    }))

    return {
      overview,
      dashboard,
      answers,
      comparisonCards,
      heroFeedback,
      activityPoints,
      measurementItems,
      stars,
      level,
      nextLevelRemaining,
      bmiLabel: resolveBmiLabel(overview.bodyComposition.bmiStatus),
    }
  }, [dashboard, progressQuery.overview])

  return {
    viewState,
    data,
    dashboard,
    isDashboardReady: studentHubQuery.uiState === 'ready' && !!dashboard,
    registerWater: studentHubQuery.registerWater,
    isRegisterWaterPending: studentHubQuery.isRegisterWaterPending,
    registerWeight: progressQuery.registerWeight,
    requestMeasurementsUpdate: progressQuery.requestMeasurementsUpdate,
    isRegisteringWeight: progressQuery.isRegisteringWeight,
    isRequestingMeasurementsUpdate: progressQuery.isRequestingMeasurementsUpdate,
    refresh: async () => {
      await Promise.all([progressQuery.refresh(), studentHubQuery.refresh()])
    },
    error: progressQuery.error ?? studentHubQuery.error,
  }
}
