import { useEffect, useMemo, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'

import { FqAlert, FqButton, FqCard, FqGoalRing, FqModal, FqProgressBar, FqQuickActions, FqStatCard, FqStepper, FqTag, FqText, FqTimeline, useToast } from '@/shared/ui'
import { workoutService, type WorkoutSession, type WorkoutSessionSummary } from '@/shared/services'

type SessionUiState = 'loading' | 'ready' | 'error' | 'empty'

function formatSeconds(totalSeconds: number) {
  const safe = Math.max(totalSeconds, 0)
  const minutes = Math.floor(safe / 60)
  const seconds = safe % 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

const sessionFlowSteps = [
  { id: 'prepare', title: 'Preparar', description: 'Revise treino e inicie a sessao.', icon: 'list' },
  { id: 'execute', title: 'Executar', description: 'Marque series e controle pausas.', icon: 'play' },
  { id: 'review', title: 'Revisar', description: 'Conclua e confira o resumo.', icon: 'check' },
] as const

export function TrainingSessionPage() {
  const history = useHistory()
  const location = useLocation<{ workoutId?: string } | undefined>()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const [uiState, setUiState] = useState<SessionUiState>('loading')
  const [session, setSession] = useState<WorkoutSession | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [isExecutionStarted, setIsExecutionStarted] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  const [restRemainingSec, setRestRemainingSec] = useState(0)
  const [isRestRunning, setIsRestRunning] = useState(false)

  const [summary, setSummary] = useState<WorkoutSessionSummary | null>(null)
  const [isSummaryOpen, setIsSummaryOpen] = useState(false)

  useEffect(() => {
    let mounted = true

    async function loadSession() {
      setUiState('loading')
      setErrorMessage(null)

      try {
        const selectedWorkoutId = location.state?.workoutId
        const activeSession = await workoutService.startSession(
          selectedWorkoutId ? { workoutId: selectedWorkoutId } : undefined,
        )

        if (!mounted) {
          return
        }

        setSession(activeSession)
        setIsExecutionStarted(activeSession.totalElapsedSec > 0)
        setIsPaused(activeSession.status === 'paused')

        if (!activeSession.exercises.length) {
          setUiState('empty')
          return
        }

        setRestRemainingSec(activeSession.restTimerSec)
        setUiState('ready')
      } catch (error) {
        if (!mounted) {
          return
        }

        setUiState('error')
        setErrorMessage(error instanceof Error ? error.message : 'Nao foi possivel carregar a sessao.')
      }
    }

    void loadSession()

    return () => {
      mounted = false
    }
  }, [location.state])

  useEffect(() => {
    if (!session || !isExecutionStarted || isPaused || session.status === 'completed') {
      return
    }

    const interval = window.setInterval(() => {
      setSession((currentSession) => {
        if (!currentSession) {
          return currentSession
        }

        return {
          ...currentSession,
          totalElapsedSec: currentSession.totalElapsedSec + 1,
        }
      })
    }, 1000)

    return () => {
      window.clearInterval(interval)
    }
  }, [isExecutionStarted, isPaused, session])

  useEffect(() => {
    if (!isRestRunning || isPaused) {
      return
    }

    const interval = window.setInterval(() => {
      setRestRemainingSec((currentValue) => {
        if (currentValue <= 1) {
          setIsRestRunning(false)
          return 0
        }

        return currentValue - 1
      })
    }, 1000)

    return () => {
      window.clearInterval(interval)
    }
  }, [isPaused, isRestRunning])

  const completedSets = useMemo(() => {
    if (!session) {
      return 0
    }

    return session.exercises.reduce((total, exercise) => {
      const done = session.setsDoneByExerciseId[exercise.id] ?? 0
      return total + Math.min(done, exercise.sets)
    }, 0)
  }, [session])

  const totalSets = useMemo(() => {
    if (!session) {
      return 0
    }

    return session.exercises.reduce((total, exercise) => total + exercise.sets, 0)
  }, [session])

  const completedExercises = useMemo(() => {
    if (!session) {
      return 0
    }

    return session.exercises.filter((exercise) => {
      const done = session.setsDoneByExerciseId[exercise.id] ?? 0
      return done >= exercise.sets
    }).length
  }, [session])

  const completionPct = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0
  const activeStep = session?.status === 'completed' ? 2 : isExecutionStarted ? 1 : 0

  const timelineItems = useMemo(
    () =>
      (session?.exercises ?? []).map((exercise) => {
        const doneSets = session?.setsDoneByExerciseId[exercise.id] ?? 0
        const isDone = doneSets >= exercise.sets

        return {
          id: exercise.id,
          title: `${exercise.order}. ${exercise.name}`,
          description: `${doneSets}/${exercise.sets} series concluidas`,
          tone: isDone ? ('success' as const) : doneSets > 0 ? ('warning' as const) : ('secondary' as const),
        }
      }),
    [session],
  )

  async function persistProgress(nextSession: WorkoutSession) {
    setSession(nextSession)

    try {
      await workoutService.saveSessionProgress(nextSession)
      await queryClient.invalidateQueries({ queryKey: ['progress'] })
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Falha ao salvar progresso da sessao.')
      toast({
        title: 'Falha ao salvar progresso',
        description: 'Seu treino continua ativo. Tente salvar novamente em alguns segundos.',
        tone: 'danger',
      })
    }
  }

  function handleStartSession() {
    if (!session) {
      return
    }

    setIsExecutionStarted(true)
    setIsPaused(false)

    void persistProgress({
      ...session,
      status: 'active',
      pausedAt: undefined,
    })
    toast({
      title: 'Sessao iniciada',
      description: 'Bons treinos. Marque cada serie concluida.',
      tone: 'success',
    })
  }

  function handleTogglePauseResume() {
    if (!session || !isExecutionStarted) {
      return
    }

    const nextPaused = !isPaused
    setIsPaused(nextPaused)

    void persistProgress({
      ...session,
      status: nextPaused ? 'paused' : 'active',
      pausedAt: nextPaused ? new Date().toISOString() : undefined,
    })
    toast({
      title: nextPaused ? 'Sessao pausada' : 'Sessao retomada',
      description: nextPaused ? 'Quando quiser, retome para continuar.' : 'Continue de onde parou.',
      tone: 'secondary',
    })
  }

  function handleMarkSetDone(exerciseId: string) {
    if (!session || !isExecutionStarted || isPaused) {
      return
    }

    const exercise = session.exercises.find((item) => item.id === exerciseId)

    if (!exercise) {
      return
    }

    const currentDone = session.setsDoneByExerciseId[exerciseId] ?? 0

    if (currentDone >= exercise.sets) {
      return
    }

    const nextSession: WorkoutSession = {
      ...session,
      status: 'active',
      setsDoneByExerciseId: {
        ...session.setsDoneByExerciseId,
        [exerciseId]: currentDone + 1,
      },
      pausedAt: undefined,
    }

    setRestRemainingSec(session.restTimerSec)
    setIsRestRunning(true)

    void persistProgress(nextSession)

    if (currentDone + 1 >= exercise.sets) {
      toast({
        title: 'Exercicio concluido',
        description: `${exercise.name} finalizado.`,
        tone: 'success',
      })
    }
  }

  function handleSkipRest() {
    setIsRestRunning(false)
    setRestRemainingSec(0)
    toast({
      title: 'Descanso pulado',
      description: 'Voce pode seguir para a proxima serie.',
      tone: 'secondary',
    })
  }

  async function handleCompleteSession() {
    if (!session) {
      return
    }

    try {
      const summaryResponse = await workoutService.completeSession({
        ...session,
        status: 'completed',
      })

      setSummary(summaryResponse)
      setIsSummaryOpen(true)
      toast({
        title: 'Sessao concluida',
        description: 'Resumo pronto para revisao.',
        tone: 'success',
      })

      setSession((currentSession) => {
        if (!currentSession) {
          return currentSession
        }

        return {
          ...currentSession,
          status: 'completed',
          completedAt: summaryResponse.completedAt,
        }
      })
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['progress'] }),
        queryClient.invalidateQueries({ queryKey: ['gamification', 'overview'] }),
        queryClient.invalidateQueries({ queryKey: ['home', 'dashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['ranking'] }),
        queryClient.invalidateQueries({ queryKey: ['notifications'] }),
      ])
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Nao foi possivel concluir a sessao.')
      toast({
        title: 'Falha ao concluir sessao',
        description: error instanceof Error ? error.message : 'Tente novamente.',
        tone: 'danger',
      })
    }
  }

  const quickActions = session
    ? [
        !isExecutionStarted
          ? {
              id: 'start',
              label: 'Iniciar',
              icon: 'play' as const,
              onClick: handleStartSession,
            }
          : {
              id: 'pause-resume',
              label: isPaused ? 'Retomar sessao' : 'Pausar sessao',
              icon: isPaused ? ('play' as const) : ('clock' as const),
              tone: 'warning' as const,
              onClick: handleTogglePauseResume,
            },
        {
          id: 'complete',
          label: 'Concluir',
          icon: 'check' as const,
          tone: 'success' as const,
          disabled: !isExecutionStarted || completedSets === 0,
          onClick: () => void handleCompleteSession(),
        },
        isRestRunning
          ? {
              id: 'skip-rest',
              label: 'Pular descanso',
              icon: 'arrowRight' as const,
              tone: 'neutral' as const,
              onClick: handleSkipRest,
            }
          : {
              id: 'back',
              label: 'Voltar',
              icon: 'arrowLeft' as const,
              tone: 'neutral' as const,
              onClick: () => history.push('/tabs/workouts'),
            },
      ]
    : []

  if (uiState === 'loading') {
    return (
      <section className="fq-page-shell-medium">
        <FqCard className="border-border bg-card">
          <FqText as="h1" variant="title" className="text-lg">
            Carregando sessao de treino...
          </FqText>
        </FqCard>
      </section>
    )
  }

  if (uiState === 'error') {
    return (
      <section className="fq-page-shell-medium">
        <FqAlert tone="danger" title="Falha ao carregar a sessao">
          {errorMessage ?? 'Tente novamente para continuar seu treino.'}
        </FqAlert>
        <FqButton onClick={() => history.push('/tabs/workouts')} variant="outline" tone="neutral">
          Voltar para Treinos
        </FqButton>
      </section>
    )
  }

  if (uiState === 'empty' || !session) {
    return (
      <section className="fq-page-shell-medium">
        <FqCard className="border-border bg-card">
          <FqText as="h1" variant="title" className="text-lg">
            Nenhum exercicio disponivel para esta sessao
          </FqText>
        </FqCard>
        <FqButton onClick={() => history.push('/tabs/workouts')} variant="outline" tone="neutral">
          Voltar para Treinos
        </FqButton>
      </section>
    )
  }

  return (
    <>
      <section className="fq-page-shell">
        <header className="fq-page-header">
          <FqText as="h1" variant="title" className="text-lg">
            Sessao de treino
          </FqText>
          <FqText as="p" className="text-sm text-muted-foreground">
            Execute os exercicios, marque as series e conclua a sessao.
          </FqText>
        </header>

        <FqStepper steps={sessionFlowSteps} activeStep={activeStep} />

        <div className="grid gap-4 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-8">
            <FqCard className="border-border bg-card">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <FqText as="p" className="text-sm font-semibold text-foreground">
                    {session.title}
                  </FqText>
                  <FqTag tone={session.status === 'completed' ? 'success' : isPaused ? 'warning' : 'secondary'}>
                    {session.status === 'completed' ? 'Concluida' : isPaused ? 'Pausada' : 'Em execucao'}
                  </FqTag>
                </div>

                <FqProgressBar value={completionPct} tone="primary" showLabel />

                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  <FqStatCard label="Series" value={`${completedSets}/${totalSets}`} icon="check" />
                  <FqStatCard label="Exercicios" value={`${completedExercises}/${session.exercises.length}`} icon="list" />
                  <FqStatCard label="Tempo" value={formatSeconds(session.totalElapsedSec)} icon="clock" />
                  <FqStatCard label="Descanso" value={isRestRunning ? formatSeconds(restRemainingSec) : '--:--'} icon="activity" />
                </div>

                <div className="flex flex-wrap gap-2">
                  {!isExecutionStarted ? (
                    <FqButton onClick={handleStartSession} leftIcon="play">
                      Iniciar sessao
                    </FqButton>
                  ) : (
                    <FqButton onClick={handleTogglePauseResume} tone={isPaused ? 'secondary' : 'warning'}>
                      {isPaused ? 'Retomar' : 'Pausar'}
                    </FqButton>
                  )}

                  <FqButton
                    onClick={handleCompleteSession}
                    tone="success"
                    leftIcon="check"
                    isDisabled={!isExecutionStarted || completedSets === 0}
                  >
                    Concluir sessao
                  </FqButton>

                  <FqButton variant="outline" tone="neutral" onClick={() => history.push('/tabs/workouts')}>
                    Voltar
                  </FqButton>
                </div>

                {isRestRunning ? (
                  <FqAlert tone="secondary" title="Descanso em andamento">
                    Restam {formatSeconds(restRemainingSec)} para a proxima serie.
                    <div className="mt-2">
                      <FqButton size="sm" tone="neutral" variant="outline" onClick={handleSkipRest}>
                        Pular descanso
                      </FqButton>
                    </div>
                  </FqAlert>
                ) : null}
              </div>
            </FqCard>

            <div className="space-y-3">
              {session.exercises.map((exercise) => {
                const setsDone = session.setsDoneByExerciseId[exercise.id] ?? 0
                const isExerciseDone = setsDone >= exercise.sets

                return (
                  <FqCard key={exercise.id} className="border-border bg-card">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <FqText as="p" className="text-base font-semibold text-foreground">
                            {exercise.order}. {exercise.name}
                          </FqText>
                          <FqText as="p" className="text-sm text-muted-foreground">
                            {exercise.sets} series x {exercise.reps} reps • {exercise.durationMin} min
                          </FqText>
                        </div>
                        <FqTag tone={isExerciseDone ? 'success' : 'neutral'}>
                          {setsDone}/{exercise.sets}
                        </FqTag>
                      </div>

                      <FqProgressBar value={Math.round((setsDone / Math.max(exercise.sets, 1)) * 100)} showLabel={false} />

                      <FqButton
                        onClick={() => handleMarkSetDone(exercise.id)}
                        leftIcon="check"
                        isDisabled={!isExecutionStarted || isPaused || isExerciseDone || session.status === 'completed'}
                      >
                        Concluir serie
                      </FqButton>
                    </div>
                  </FqCard>
                )
              })}
            </div>
          </div>

          <aside className="space-y-4 lg:col-span-4">
            <FqGoalRing
              value={completionPct}
              max={100}
              title="Meta da sessao"
              subtitle="Concluir 100% das series planejadas."
              tone="primary"
            />

            <FqCard className="border-border bg-card">
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Iniciada: {new Date(session.startedAt).toLocaleTimeString()}</p>
                <p>Status: {session.status}</p>
                <p>Tempo total: {formatSeconds(session.totalElapsedSec)}</p>
              </div>
            </FqCard>

            <FqTimeline items={timelineItems} />
          </aside>
        </div>
      </section>

      <FqQuickActions actions={quickActions} />

      <FqModal
        open={isSummaryOpen}
        onOpenChange={setIsSummaryOpen}
        title="Resumo da sessao"
        description="Sessao finalizada com sucesso."
        footer={
          <div className="flex justify-end gap-2">
            <FqButton variant="outline" tone="neutral" onClick={() => setIsSummaryOpen(false)}>
              Fechar
            </FqButton>
            <FqButton onClick={() => history.push('/tabs/workouts')}>Voltar para Treinos</FqButton>
          </div>
        }
      >
        {summary ? (
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="text-foreground">{summary.title}</p>
            <p>Exercicios concluidos: {summary.completedExercises}/{summary.totalExercises}</p>
            <p>Series concluidas: {summary.completedSets}/{summary.totalSets}</p>
            <p>Duracao: {formatSeconds(summary.durationSec)}</p>
          </div>
        ) : null}
      </FqModal>
    </>
  )
}
