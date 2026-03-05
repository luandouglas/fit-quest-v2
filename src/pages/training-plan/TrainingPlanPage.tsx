import { useEffect, useMemo, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import { progressService, type ProgressOverview } from '@/shared/services'
import { useToast } from '@/shared/ui'
import { FqButton, FqCard, FqIcon, FqProgressBar, FqQuickActions, FqStatCard, FqTag, FqText } from '@/shared/ui'
import { WeeklyCalendarCard } from './components'
import {
  TrainingPlanEmptyState,
  TrainingPlanErrorState,
  TrainingPlanLoadingState,
} from './components/TrainingPlanFeedbackStates'
import { useTrainingPlanState } from './hooks/useTrainingPlanState'
import type { WorkoutPlanItem } from './types'

type ViewFilter = 'today' | 'week' | 'upcoming' | 'history'

const filterOptions: Array<{ value: ViewFilter; label: string }> = [
  { value: 'today', label: 'Hoje' },
  { value: 'week', label: 'Semana' },
  { value: 'upcoming', label: 'Proximos' },
  { value: 'history', label: 'Historico' },
]

const statusToneMap = {
  completed: 'success',
  pending: 'secondary',
  late: 'warning',
} as const

const statusLabelMap = {
  completed: 'Concluido',
  pending: 'Pendente',
  late: 'Atrasado',
} as const

function formatDateShort(date: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  }).format(new Date(`${date}T12:00:00`))
}

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

function formatDuration(totalSec: number) {
  const safe = Math.max(totalSec, 0)
  const minutes = Math.floor(safe / 60)
  const seconds = safe % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function getGreetingLabel() {
  const hour = new Date().getHours()

  if (hour < 12) {
    return 'Bom dia'
  }

  if (hour < 18) {
    return 'Boa tarde'
  }

  return 'Boa noite'
}

export function TrainingPlanPage() {
  const history = useHistory()
  const { toast } = useToast()
  const {
    uiState,
    allWorkouts,
    week,
    selectedDate,
    selectedDay,
    hasWorkoutToday,
    exercises,
    permissions,
    progressPct,
    todayWorkout,
    totalDurationMin,
    activeSession,
    isCreatingQuickWorkout,
    setSelectedDate,
    createQuickWorkout,
    retryLoad,
  } = useTrainingPlanState()
  const safeAllWorkouts = allWorkouts ?? []

  const [activeFilter, setActiveFilter] = useState<ViewFilter>('today')
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(null)
  const [showHistorySection, setShowHistorySection] = useState(true)
  const [activeSessionElapsedSec, setActiveSessionElapsedSec] = useState(activeSession?.totalElapsedSec ?? 0)

  const progressOverviewQuery = useQuery<ProgressOverview>({
    queryKey: ['progress', 'overview', '30d', 'workouts-page'],
    queryFn: () => progressService.getOverview('30d'),
    staleTime: 30_000,
  })

  useEffect(() => {
    if (!activeSession) {
      setActiveSessionElapsedSec(0)
      return
    }

    setActiveSessionElapsedSec(activeSession.totalElapsedSec)
  }, [activeSession?.sessionId, activeSession?.totalElapsedSec])

  useEffect(() => {
    if (!activeSession || activeSession.status !== 'active') {
      return
    }

    const intervalId = window.setInterval(() => {
      setActiveSessionElapsedSec((value) => value + 1)
    }, 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [activeSession?.sessionId, activeSession?.status])

  const weekDates = useMemo(() => new Set(week.map((day) => day.date)), [week])
  const sortedWorkouts = useMemo(
    () => [...safeAllWorkouts].sort((left, right) => left.date.localeCompare(right.date)),
    [safeAllWorkouts],
  )

  const filteredWorkouts = useMemo(() => {
    const today = new Date()
    const todayKey = today.toISOString().slice(0, 10)

    if (activeFilter === 'today') {
      return sortedWorkouts.filter((workout) => workout.date === todayKey)
    }

    if (activeFilter === 'week') {
      return sortedWorkouts.filter((workout) => weekDates.has(workout.date))
    }

    if (activeFilter === 'upcoming') {
      return sortedWorkouts.filter((workout) => workout.status !== 'completed' && workout.date >= todayKey)
    }

    return sortedWorkouts
      .filter((workout) => workout.status === 'completed' || workout.date < todayKey)
      .sort((left, right) => right.date.localeCompare(left.date))
  }, [activeFilter, sortedWorkouts, weekDates])

  const completedWeekCount = useMemo(
    () => sortedWorkouts.filter((workout) => weekDates.has(workout.date) && workout.status === 'completed').length,
    [sortedWorkouts, weekDates],
  )

  const totalWeekCount = useMemo(
    () => sortedWorkouts.filter((workout) => weekDates.has(workout.date)).length,
    [sortedWorkouts, weekDates],
  )

  const weeklyTrainingMinutes = useMemo(
    () =>
      sortedWorkouts
        .filter((workout) => weekDates.has(workout.date) && workout.status === 'completed')
        .reduce((total, workout) => total + workout.estimatedDurationMin, 0),
    [sortedWorkouts, weekDates],
  )

  const weeklyVolumeKg = useMemo(() => {
    const overview = progressOverviewQuery.data
    if (!overview || overview.strengthWeeklyVolume.length === 0) {
      return 0
    }

    const latestWeek = overview.strengthWeeklyVolume[overview.strengthWeeklyVolume.length - 1]
    return Math.round(latestWeek?.volumeKg ?? 0)
  }, [progressOverviewQuery.data])

  const recentHistory = useMemo(() => progressOverviewQuery.data?.recentHistory.slice(0, 5) ?? [], [progressOverviewQuery.data])

  const recentPrByDate = useMemo(() => {
    const prs = progressOverviewQuery.data?.strengthPrs ?? []
    const map = new Map<string, number>()

    prs.forEach((pr) => {
      const dateKey = pr.achievedAt.slice(0, 10)
      map.set(dateKey, (map.get(dateKey) ?? 0) + 1)
    })

    return map
  }, [progressOverviewQuery.data?.strengthPrs])

  const dynamicInsight = useMemo(() => {
    if (totalWeekCount === 0) {
      return 'Sem treinos programados para esta semana. Explore treinos para manter o ritmo.'
    }

    const remaining = Math.max(totalWeekCount - completedWeekCount, 0)
    if (remaining === 0) {
      return 'Meta semanal concluida. Excelente consistencia.'
    }

    if (remaining === 1) {
      return 'Voce esta a 1 treino da sua meta semanal.'
    }

    return `Faltam ${remaining} treinos para bater sua meta semanal.`
  }, [completedWeekCount, totalWeekCount])

  const heroStatus = useMemo(() => {
    if (activeSession) {
      return {
        title: 'Sessao em andamento',
        description: 'Retome para finalizar seu treino sem perder progresso.',
        cta: 'Continuar sessao',
      }
    }

    if (!hasWorkoutToday) {
      return {
        title: 'Sem treino programado',
        description: 'Explore os proximos treinos para manter consistencia na semana.',
        cta: 'Explorar treinos',
      }
    }

    if (todayWorkout.progressPct >= 100) {
      return {
        title: 'Voce ja treinou hoje',
        description: 'Parabens. Continue no ritmo e acompanhe sua evolucao semanal.',
        cta: 'Ver historico',
      }
    }

    return {
      title: 'Treino de hoje pronto',
      description: 'Seu plano esta preparado. Comece agora para manter o streak ativo.',
      cta: 'Iniciar treino',
    }
  }, [activeSession, hasWorkoutToday, todayWorkout.progressPct])

  function handleStartWorkout(workoutId?: string) {
    history.push('/tabs/workouts/session', workoutId ? { workoutId } : undefined)
  }

  function handleHeroAction() {
    if (activeSession) {
      handleStartWorkout(activeSession.workoutId)
      return
    }

    if (!hasWorkoutToday) {
      setActiveFilter('upcoming')
      return
    }

    if (todayWorkout.progressPct >= 100) {
      history.push('/tabs/progress')
      return
    }

    handleStartWorkout(todayWorkout.workoutId)
  }

  async function handleCreateQuickWorkout() {
    try {
      await createQuickWorkout()
      toast({
        title: 'Treino rapido criado',
        description: 'Novo treino adicionado ao seu plano.',
        tone: 'success',
      })
    } catch (error) {
      toast({
        title: 'Falha ao criar treino rapido',
        description: error instanceof Error ? error.message : 'Tente novamente.',
        tone: 'danger',
      })
    }
  }

  function getWorkoutProgress(workout: WorkoutPlanItem) {
    if (workout.status === 'completed') {
      return 100
    }

    if (workout.date === selectedDate && workout.date === week.find((day) => day.isToday)?.date) {
      return progressPct
    }

    if (workout.status === 'late') {
      return 20
    }

    return workout.isActive ? 45 : 0
  }

  function getEstimatedExerciseCount(workout: WorkoutPlanItem) {
    if (workout.date === selectedDate && exercises.length > 0) {
      return exercises.length
    }

    return Math.max(4, Math.round(workout.estimatedDurationMin / 8))
  }

  const quickActions = [
    {
      id: 'start',
      label: activeSession ? 'Retomar sessao' : hasWorkoutToday ? 'Iniciar treino' : 'Explorar treinos',
      icon: activeSession ? ('play' as const) : hasWorkoutToday ? ('play' as const) : ('list' as const),
      onClick: handleHeroAction,
    },
    {
      id: 'history',
      label: 'Historico',
      icon: 'chart' as const,
      tone: 'secondary' as const,
      onClick: () => history.push('/tabs/progress'),
    },
  ]

  if (uiState === 'loading') {
    return <TrainingPlanLoadingState />
  }

  if (uiState === 'error') {
    return <TrainingPlanErrorState onRetry={retryLoad} />
  }

  if (uiState === 'empty') {
    return (
      <TrainingPlanEmptyState
        onBack={() => history.goBack()}
        onShowPlans={handleCreateQuickWorkout}
        canShowPlans={permissions.canCreateQuickWorkout}
        showPlansReason={permissions.hasActivePersonal ? 'Criacao manual bloqueada para aluno com personal ativo.' : undefined}
      />
    )
  }

  return (
    <section className="fq-page-shell space-y-4 md:space-y-5">
      {activeSession ? (
        <div className="sticky top-[72px] z-20">
          <FqCard className="border-primary/30 bg-primary/10 shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <FqText as="p" className="text-sm font-semibold text-foreground">
                  Sessao em andamento
                </FqText>
                <FqText as="p" className="text-xs text-muted-foreground">
                  {activeSession.title} • {formatDuration(activeSessionElapsedSec)}
                </FqText>
              </div>
              <FqButton size="sm" leftIcon="play" onClick={() => handleStartWorkout(activeSession.workoutId)}>
                Retomar
              </FqButton>
            </div>
          </FqCard>
        </div>
      ) : null}

      <FqCard className="overflow-hidden border-border bg-gradient-to-br from-primary/10 via-card to-card shadow-sm">
        <div className="space-y-4 p-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <FqText as="p" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {getGreetingLabel()}
              </FqText>
              <FqText as="h1" variant="title" className="text-xl md:text-2xl">
                {heroStatus.title}
              </FqText>
              <FqText as="p" className="text-sm text-muted-foreground">
                {heroStatus.description}
              </FqText>
            </div>
            <FqButton className="w-full sm:w-auto" leftIcon="play" onClick={handleHeroAction}>
              {heroStatus.cta}
            </FqButton>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-border/80 bg-card/80 p-3">
              <FqText as="p" className="text-xs text-muted-foreground">Meta semanal</FqText>
              <FqText as="p" className="text-base font-semibold text-foreground">
                {completedWeekCount}/{Math.max(totalWeekCount, 1)} treinos
              </FqText>
            </div>
            <div className="rounded-2xl border border-border/80 bg-card/80 p-3">
              <FqText as="p" className="text-xs text-muted-foreground">Streak atual</FqText>
              <FqText as="p" className="text-base font-semibold text-foreground">
                {selectedDay?.status === 'completed' ? 'Ativo' : 'Em construcao'}
              </FqText>
            </div>
            <div className="rounded-2xl border border-border/80 bg-card/80 p-3 sm:col-span-2 lg:col-span-1">
              <FqText as="p" className="text-xs text-muted-foreground">Insight da semana</FqText>
              <FqText as="p" className="text-sm font-semibold text-foreground">{dynamicInsight}</FqText>
            </div>
          </div>
        </div>
      </FqCard>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <FqStatCard
          label="Treinos concluidos"
          value={completedWeekCount}
          helperText="na semana atual"
          icon="dumbbell"
        />
        <FqStatCard
          label="Tempo total treinado"
          value={`${weeklyTrainingMinutes} min`}
          helperText="somente treinos concluidos"
          icon="clock"
        />
        <FqStatCard
          label="Volume semanal"
          value={weeklyVolumeKg > 0 ? `${weeklyVolumeKg} kg` : '--'}
          helperText="baseado no progresso semanal"
          icon="flame"
        />
      </div>

      <WeeklyCalendarCard days={week} selectedDate={selectedDate} onSelectDate={setSelectedDate} />

      <div className="flex flex-wrap gap-2">
        {filterOptions.map((option) => (
          <FqButton
            key={option.value}
            size="sm"
            variant={activeFilter === option.value ? 'solid' : 'outline'}
            tone={activeFilter === option.value ? 'primary' : 'neutral'}
            onClick={() => setActiveFilter(option.value)}
          >
            {option.label}
          </FqButton>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="space-y-3 lg:col-span-8">
          {filteredWorkouts.length === 0 ? (
            <FqCard className="border-border bg-card">
              <FqText as="p" className="text-sm text-muted-foreground">
                Sem treinos para o filtro selecionado.
              </FqText>
              <FqButton className="mt-3" size="sm" onClick={() => setActiveFilter('week')}>
                Ver semana completa
              </FqButton>
            </FqCard>
          ) : (
            filteredWorkouts.map((workout) => {
              const progress = getWorkoutProgress(workout)
              const isExpanded = expandedWorkoutId === workout.id
              const recentMatch = progressOverviewQuery.data?.recentHistory.find((item) => item.title === workout.title) ?? null
              const prCount = recentPrByDate.get(workout.date) ?? 0

              return (
                <article
                  key={workout.id}
                  className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <button
                    type="button"
                    className="flex w-full flex-col gap-3 p-4 text-left"
                    onClick={() => setExpandedWorkoutId((current) => (current === workout.id ? null : workout.id))}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <FqText as="h3" className="text-base font-semibold text-foreground">
                          {workout.title}
                        </FqText>
                        <FqText as="p" className="text-xs text-muted-foreground">
                          {formatDateShort(workout.date)} • {workout.estimatedDurationMin} min • {getEstimatedExerciseCount(workout)} exercicios
                        </FqText>
                      </div>
                      <div className="flex items-center gap-2">
                        <FqTag tone={statusToneMap[workout.status]}>{statusLabelMap[workout.status]}</FqTag>
                        <FqIcon name={isExpanded ? 'chevronUp' : 'chevronDown'} size={14} className="text-muted-foreground" />
                      </div>
                    </div>
                    <FqProgressBar value={progress} tone={progress >= 100 ? 'success' : 'primary'} showLabel={false} />
                  </button>

                  <div className={`grid transition-all duration-300 ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                    <div className="overflow-hidden">
                      <div className="space-y-3 border-t border-border/60 px-4 py-3">
                        <div className="grid gap-2 sm:grid-cols-2">
                          <div className="rounded-xl border border-border bg-muted/20 p-3">
                            <FqText as="p" className="text-xs text-muted-foreground">Ultima execucao</FqText>
                            <FqText as="p" className="text-sm font-semibold text-foreground">
                              {recentMatch ? formatDateTime(recentMatch.completedAt) : 'Sem execucao recente'}
                            </FqText>
                          </div>
                          <div className="rounded-xl border border-border bg-muted/20 p-3">
                            <FqText as="p" className="text-xs text-muted-foreground">PR recente</FqText>
                            <FqText as="p" className="text-sm font-semibold text-foreground">
                              {prCount > 0 ? `${prCount} PR(s) nessa data` : 'Sem PR recente'}
                            </FqText>
                          </div>
                        </div>

                        <div className="rounded-xl border border-border bg-muted/20 p-3">
                          <FqText as="p" className="mb-2 text-xs text-muted-foreground">Exercicios</FqText>
                          <ul className="grid gap-1">
                            {(workout.date === selectedDate ? exercises : []).slice(0, 5).map((exercise) => (
                              <li key={`${workout.id}-${exercise.id}`} className="text-sm text-foreground">
                                {exercise.order}. {exercise.name} • {exercise.sets}x{exercise.reps}
                              </li>
                            ))}
                            {workout.date !== selectedDate ? (
                              <li className="text-sm text-muted-foreground">Selecione o dia no calendario para ver detalhes dos exercicios.</li>
                            ) : null}
                          </ul>
                        </div>

                        <FqButton
                          size="sm"
                          leftIcon="play"
                          onClick={(event) => {
                            event.stopPropagation()
                            handleStartWorkout(workout.id)
                          }}
                        >
                          Iniciar
                        </FqButton>
                      </div>
                    </div>
                  </div>
                </article>
              )
            })
          )}
        </div>

        <aside className="space-y-4 lg:col-span-4">
          <FqCard className="border-border bg-card">
            <FqText as="h2" className="text-sm font-semibold text-foreground">
              Resumo semanal
            </FqText>
            <div className="mt-3 space-y-2">
              <FqTag tone="secondary" className="w-full justify-between rounded-xl px-3 py-2">
                <span>Progresso semanal</span>
                <span>{completedWeekCount}/{Math.max(totalWeekCount, 1)}</span>
              </FqTag>
              <FqTag tone="neutral" className="w-full justify-between rounded-xl px-3 py-2">
                <span>Duracao total</span>
                <span>{totalDurationMin} min</span>
              </FqTag>
            </div>
            <div className="mt-3 flex flex-col gap-2">
              <FqButton variant="outline" tone="secondary" leftIcon="plus" onClick={handleCreateQuickWorkout} isLoading={isCreatingQuickWorkout} isDisabled={!permissions.canCreateQuickWorkout}>
                Criar treino rapido
              </FqButton>
              {!permissions.canCreateQuickWorkout ? (
                <FqText as="p" className="text-xs text-muted-foreground">
                  Treino rapido bloqueado para aluno com personal ativo.
                </FqText>
              ) : null}
              <FqButton variant="outline" tone="neutral" leftIcon="target" onClick={() => history.push('/tabs/gamification')}>
                Metas da semana
              </FqButton>
            </div>
          </FqCard>

          <FqCard className="border-border bg-card">
            <div className="flex items-center justify-between gap-2">
              <FqText as="h2" className="text-sm font-semibold text-foreground">
                Historico recente
              </FqText>
              <FqButton size="sm" variant="ghost" tone="neutral" onClick={() => setShowHistorySection((value) => !value)}>
                {showHistorySection ? 'Ocultar' : 'Mostrar'}
              </FqButton>
            </div>
            {showHistorySection ? (
              <div className="mt-3 space-y-2">
                {recentHistory.length === 0 ? (
                  <FqText as="p" className="text-sm text-muted-foreground">
                    Ainda sem historico recente.
                  </FqText>
                ) : (
                  recentHistory.map((session) => {
                    const dayKey = session.completedAt.slice(0, 10)
                    const prCount = recentPrByDate.get(dayKey) ?? 0
                    return (
                      <div key={session.sessionId} className="rounded-xl border border-border bg-muted/20 p-3">
                        <FqText as="p" className="text-sm font-semibold text-foreground">
                          {session.title}
                        </FqText>
                        <FqText as="p" className="text-xs text-muted-foreground">
                          {formatDateTime(session.completedAt)} • {Math.round(session.durationSec / 60)} min
                        </FqText>
                        <FqText as="p" className="text-xs text-muted-foreground">
                          Volume: {session.completedSets}/{session.totalSets} series • PRs: {prCount}
                        </FqText>
                      </div>
                    )
                  })
                )}
                <FqButton variant="outline" tone="neutral" className="w-full" onClick={() => history.push('/tabs/progress')}>
                  Ver historico completo
                </FqButton>
              </div>
            ) : null}
          </FqCard>
        </aside>
      </div>

      <FqQuickActions actions={quickActions} />
    </section>
  )
}
