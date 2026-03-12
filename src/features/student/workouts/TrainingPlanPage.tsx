import { useMemo } from 'react'
import { useHistory } from 'react-router-dom'

import { FqAlert, FqButton, FqCard, FqQuickActions, FqStatCard, FqText, useToast } from '@/shared/ui'
import { studentRoutes } from '@/features/student/routes'
import { StudentPageHeader } from '@/features/student/components'

import {
  TodayWorkoutHero,
  TrainingPlanEmptyState,
  TrainingPlanErrorState,
  TrainingPlanLoadingState,
  WeeklyCalendarCard,
  WorkoutHistoryCard,
  WorkoutPlanList,
} from './components'
import { useTrainingPlanState } from './hooks/useTrainingPlanState'

type PrimaryAlert = {
  tone: 'primary' | 'secondary' | 'warning' | 'neutral'
  title: string
  description: string
  action: () => void
  label: string
}

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10)
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
    selectedDateWorkouts,
    hasWorkoutToday,
    permissions,
    history: workoutHistory,
    activeSession,
    todayWorkout,
    isCreatingQuickWorkout,
    createQuickWorkout,
    setSelectedDate,
    retryLoad,
  } = useTrainingPlanState()

  const todayKey = toIsoDate(new Date())
  const pendingTodayWorkout = allWorkouts.find((workout) => workout.date === todayKey && workout.status !== 'completed')
  const weeklyCompleted = week.filter((day) => day.status === 'completed').length
  const weeklyScheduled = week.filter((day) => day.hasWorkout).length
  const lateCount = allWorkouts.filter((workout) => workout.status === 'late').length
  const selectedWorkouts = selectedDateWorkouts.length
    ? selectedDateWorkouts
    : allWorkouts.filter((workout) => workout.status !== 'completed').slice(0, 4)

  const primaryAlert = useMemo<PrimaryAlert | null>(() => {
    if (activeSession) {
      return {
        tone: 'secondary' as const,
        title: 'Sessão em andamento',
        description: 'Seu treino continua salvo. Retome de onde parou com um toque.',
        action: () => {
          history.push(studentRoutes.workoutSession, { workoutId: activeSession.workoutId })
        },
        label: 'Retomar sessao agora',
      }
    }

    if (pendingTodayWorkout) {
      return {
        tone: pendingTodayWorkout.status === 'late' ? ('warning' as const) : ('primary' as const),
        title: pendingTodayWorkout.status === 'late' ? 'Treino atrasado' : 'Treino de hoje aguardando início',
        description:
          pendingTodayWorkout.status === 'late'
            ? 'Você ainda pode recuperar a aderência iniciando agora.'
            : 'Abra o treino do dia para manter streak e progresso semanal.',
        action: () => {
          history.push(`${studentRoutes.workouts}/${pendingTodayWorkout.id}`)
        },
        label: 'Ver treino de hoje',
      }
    }

    if (!hasWorkoutToday && permissions.canCreateQuickWorkout) {
      return {
        tone: 'neutral' as const,
        title: 'Sem treino fixo para hoje',
        description: 'Crie um treino rápido para não quebrar sua rotina diária.',
        action: () => void handleCreateQuickWorkout(),
        label: 'Criar treino rápido',
      }
    }

    return null
  }, [activeSession, hasWorkoutToday, history, pendingTodayWorkout, permissions.canCreateQuickWorkout])

  async function handleCreateQuickWorkout() {
    try {
      await createQuickWorkout()
      toast({
        title: 'Treino rápido pronto',
        description: 'Seu treino foi adicionado à rotina de hoje.',
        tone: 'success',
      })
    } catch (error) {
      toast({
        title: 'Não foi possível criar treino rápido',
        description: error instanceof Error ? error.message : 'Tente novamente.',
        tone: 'danger',
      })
    }
  }

  function openWorkoutDetail(workoutId: string) {
    history.push(`${studentRoutes.workouts}/${workoutId}`)
  }

  function startWorkout(workoutId?: string) {
    history.push(studentRoutes.workoutSession, workoutId ? { workoutId } : undefined)
  }

  function openCompletion(sessionId: string) {
    history.push(`${studentRoutes.workouts}/completed/${sessionId}`)
  }

  if (uiState === 'loading') {
    return <TrainingPlanLoadingState />
  }

  if (uiState === 'error') {
    return <TrainingPlanErrorState onRetry={() => void retryLoad()} />
  }

  if (uiState === 'empty') {
    return (
      <TrainingPlanEmptyState
        onBack={() => history.push(studentRoutes.hub)}
        onShowPlans={handleCreateQuickWorkout}
        canShowPlans={permissions.canCreateQuickWorkout}
        showPlansReason="Treino rápido bloqueado para aluno com personal ativo."
      />
    )
  }

  return (
    <>
      <section className="fq-page-shell space-y-5">
        <StudentPageHeader
          eyebrow="Execução do aluno"
          title="Treinos"
          description="Tudo o que você precisa para executar a rotina do dia, retomar sessão e acompanhar aderência sem perder contexto."
          tags={[
            {
              id: 'weekly-adherence',
              label: `${weeklyCompleted}/${Math.max(weeklyScheduled, 1)} na semana`,
              tone: weeklyCompleted > 0 ? 'success' : 'neutral',
            },
            {
              id: 'late-workouts',
              label: lateCount > 0 ? `${lateCount} pendência${lateCount > 1 ? 's' : ''}` : 'Sem atrasos',
              tone: lateCount > 0 ? 'warning' : 'secondary',
            },
          ]}
        />

        {primaryAlert ? (
          <FqAlert tone={primaryAlert.tone} title={primaryAlert.title}>
            <div className="space-y-3">
              <p>{primaryAlert.description}</p>
              <FqButton size="sm" variant="outline" tone="neutral" onClick={primaryAlert.action}>
                {primaryAlert.label}
              </FqButton>
            </div>
          </FqAlert>
        ) : null}

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.9fr)]">
          <TodayWorkoutHero
            workout={todayWorkout}
            hasActiveSession={Boolean(activeSession)}
            onStart={() => startWorkout(todayWorkout.workoutId)}
            onOpenDetails={todayWorkout.workoutId ? () => openWorkoutDetail(todayWorkout.workoutId!) : undefined}
          />

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <FqStatCard
              label="Aderência semanal"
              value={`${weeklyCompleted}/${Math.max(weeklyScheduled, 1)}`}
              helperText="treinos concluídos nesta semana"
              icon="chart"
            />
            <FqStatCard
              label="Pendências"
              value={lateCount}
              helperText={lateCount > 0 ? 'treinos atrasados pedem recuperação' : 'sem treinos atrasados'}
              icon="clock"
            />
          </div>
        </div>

        <WeeklyCalendarCard
          days={week}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,1fr)]">
          <div className="space-y-5">
            <FqCard className="border-border bg-card">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <FqText as="h2" className="text-lg font-semibold text-foreground">
                      {selectedDay?.isToday ? 'Treinos de hoje' : 'Treinos da data selecionada'}
                    </FqText>
                    <FqText as="p" className="text-sm text-muted-foreground">
                      {selectedDay?.status === 'rest'
                        ? 'Nenhum treino fixo nesta data. Você ainda pode abrir um treino rápido.'
                        : 'Escolha um treino, veja o detalhe e execute com poucos toques.'}
                    </FqText>
                  </div>
                </div>

                <WorkoutPlanList
                  workouts={selectedWorkouts}
                  onStartSession={startWorkout}
                  onOpenDetail={openWorkoutDetail}
                  onCreateQuickWorkout={handleCreateQuickWorkout}
                  isCreatingQuickWorkout={isCreatingQuickWorkout}
                  canCreateQuickWorkout={permissions.canCreateQuickWorkout}
                  quickWorkoutBlockedReason="Treino rápido bloqueado para aluno com personal ativo."
                />
              </div>
            </FqCard>
          </div>

          <WorkoutHistoryCard history={workoutHistory} onOpenCompletion={openCompletion} />
        </div>
      </section>

      <FqQuickActions
        actions={[
          activeSession
            ? {
                id: 'resume-session',
                label: 'Retomar sessao',
                icon: 'play' as const,
                onClick: () => startWorkout(activeSession.workoutId),
              }
            : {
                id: 'start-today',
                label: 'Treino de hoje',
                icon: 'dumbbell' as const,
                onClick: () => startWorkout(todayWorkout.workoutId),
                disabled: !todayWorkout.workoutId,
              },
          {
            id: 'quick-workout',
            label: 'Treino rápido',
            icon: 'plus' as const,
            tone: 'secondary' as const,
            onClick: () => void handleCreateQuickWorkout(),
            disabled: !permissions.canCreateQuickWorkout,
          },
          {
            id: 'history',
            label: 'Ultima conclusao',
            icon: 'chart' as const,
            tone: 'neutral' as const,
            onClick: () => {
              const latest = workoutHistory[0]
              if (latest) {
                openCompletion(latest.sessionId)
              }
            },
            disabled: workoutHistory.length === 0,
          },
        ]}
      />
    </>
  )
}
