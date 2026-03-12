import { useEffect, useMemo, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'

import { studentRoutes } from '@/features/student/routes'
import { workoutService, type WorkoutSession, type WorkoutSessionSummary } from '@/shared/services'
import {
  FqAlert,
  FqButton,
  FqCard,
  FqProgressBar,
  FqQuickActions,
  FqTag,
  FqText,
  useToast,
} from '@/shared/ui'

import { WorkoutExecutionExerciseCard } from './components'

type SessionUiState = 'loading' | 'ready' | 'error' | 'empty'

function formatSeconds(totalSeconds: number) {
  const safe = Math.max(totalSeconds, 0)
  const minutes = Math.floor(safe / 60)
  const seconds = safe % 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function formatCountLabel(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`
}

function syncExerciseStatuses(session: WorkoutSession): WorkoutSession {
  const requestedExercise = session.currentExerciseId
    ? session.exercises.find((exercise) => exercise.id === session.currentExerciseId)
    : undefined
  const requestedExerciseDoneSets = requestedExercise
    ? session.setsDoneByExerciseId[requestedExercise.id] ?? 0
    : 0
  const firstIncompleteExerciseId = session.exercises.find(
    (exercise) => (session.setsDoneByExerciseId[exercise.id] ?? 0) < exercise.sets,
  )?.id
  const activeExerciseId =
    requestedExercise && requestedExerciseDoneSets < requestedExercise.sets
      ? requestedExercise.id
      : firstIncompleteExerciseId

  return {
    ...session,
    currentExerciseId: activeExerciseId,
    restTimerSec: activeExerciseId
      ? session.exercises.find((exercise) => exercise.id === activeExerciseId)?.restSec ?? session.restTimerSec
      : 0,
    exercises: session.exercises.map((exercise) => {
      const doneSets = session.setsDoneByExerciseId[exercise.id] ?? 0

      if (doneSets >= exercise.sets) {
        return {
          ...exercise,
          status: 'done',
        }
      }

      if (exercise.id === activeExerciseId) {
        return {
          ...exercise,
          status: 'current',
        }
      }

      return {
        ...exercise,
        status: 'upcoming',
      }
    }),
  }
}

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

        const preparedSession = syncExerciseStatuses(activeSession)

        setSession(preparedSession)
        setIsExecutionStarted(activeSession.totalElapsedSec > 0)
        setIsPaused(activeSession.status === 'paused')
        setRestRemainingSec(preparedSession.restTimerSec)
        setUiState(preparedSession.exercises.length ? 'ready' : 'empty')
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
      const doneSets = session.setsDoneByExerciseId[exercise.id] ?? 0
      return total + Math.min(doneSets, exercise.sets)
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
      const doneSets = session.setsDoneByExerciseId[exercise.id] ?? 0
      return doneSets >= exercise.sets
    }).length
  }, [session])

  const pendingExercises = useMemo(() => {
    if (!session) {
      return []
    }

    return session.exercises.filter((exercise) => {
      const doneSets = session.setsDoneByExerciseId[exercise.id] ?? 0
      return doneSets < exercise.sets
    })
  }, [session])

  const completionPct = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0
  const activeExercise = session?.exercises.find((exercise) => exercise.id === session.currentExerciseId) ?? null

  async function refreshWorkoutQueries() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['workouts'] }),
      queryClient.invalidateQueries({ queryKey: ['progress'] }),
      queryClient.invalidateQueries({ queryKey: ['gamification', 'overview'] }),
      queryClient.invalidateQueries({ queryKey: ['home', 'dashboard'] }),
      queryClient.invalidateQueries({ queryKey: ['ranking'] }),
      queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    ])
  }

  async function persistProgress(nextSession: WorkoutSession) {
    const preparedSession = syncExerciseStatuses(nextSession)
    setSession(preparedSession)
    setErrorMessage(null)

    try {
      await workoutService.saveSessionProgress(preparedSession)
      await refreshWorkoutQueries()
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
      description: 'Siga exercício por exercício e marque cada série.',
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
      title: nextPaused ? 'Sessão pausada' : 'Sessão retomada',
      description: nextPaused ? 'Seu progresso ficou salvo.' : 'Continue de onde você parou.',
      tone: 'secondary',
    })
  }

  function handleFocusExercise(exerciseId: string) {
    if (!session || !isExecutionStarted || isPaused) {
      return
    }

    const targetExercise = session.exercises.find((exercise) => exercise.id === exerciseId)

    if (!targetExercise) {
      return
    }

    setRestRemainingSec(targetExercise.restSec)
    setIsRestRunning(false)

    void persistProgress({
      ...session,
      currentExerciseId: exerciseId,
      restTimerSec: targetExercise.restSec,
      pausedAt: undefined,
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

    const nextSetsDoneByExerciseId = {
      ...session.setsDoneByExerciseId,
      [exerciseId]: currentDone + 1,
    }
    const nextIncompleteExercise = session.exercises.find((item) => {
      if (item.id === exerciseId) {
        return currentDone + 1 < item.sets
      }

      return (nextSetsDoneByExerciseId[item.id] ?? 0) < item.sets
    })
    const nextSession: WorkoutSession = {
      ...session,
      status: 'active',
      setsDoneByExerciseId: nextSetsDoneByExerciseId,
      pausedAt: undefined,
      currentExerciseId: nextIncompleteExercise?.id,
      restTimerSec: nextIncompleteExercise?.restSec ?? 0,
    }

    setRestRemainingSec(nextIncompleteExercise ? exercise.restSec : 0)
    setIsRestRunning(currentDone + 1 < exercise.sets || Boolean(nextIncompleteExercise))

    void persistProgress(nextSession)

    if (currentDone + 1 >= exercise.sets) {
      toast({
        title: 'Exercício concluído',
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
      description: 'Você pode seguir para a próxima série.',
      tone: 'secondary',
    })
  }

  async function handleCompleteSession() {
    if (!session) {
      return
    }

    setErrorMessage(null)

    try {
      const summaryResponse: WorkoutSessionSummary = await workoutService.completeSession({
        ...session,
        status: 'completed',
      })

      toast({
        title: 'Sessão concluída',
        description: 'Seu treino fechou com sucesso.',
        tone: 'success',
      })

      await refreshWorkoutQueries()
      history.replace(`${studentRoutes.workouts}/completed/${summaryResponse.sessionId}`, {
        summary: summaryResponse,
      })
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Nao foi possivel concluir a sessao.')
      toast({
        title: 'Falha ao concluir sessão',
        description: error instanceof Error ? error.message : 'Tente novamente.',
        tone: 'danger',
      })
    }
  }

  if (uiState === 'loading') {
    return (
      <section className="fq-page-shell-medium">
        <FqCard className="border-border bg-card">
          <FqText as="h1" className="text-lg font-semibold text-foreground">
            Carregando sessão de treino...
          </FqText>
        </FqCard>
      </section>
    )
  }

  if (uiState === 'error') {
    return (
      <section className="fq-page-shell-medium space-y-4">
        <FqAlert tone="danger" title="Falha ao carregar a sessao">
          {errorMessage ?? 'Tente novamente para continuar seu treino.'}
        </FqAlert>
        <FqButton onClick={() => history.push(studentRoutes.workouts)} variant="outline" tone="neutral">
          Voltar para Treinos
        </FqButton>
      </section>
    )
  }

  if (uiState === 'empty' || !session) {
    return (
      <section className="fq-page-shell-medium space-y-4">
        <FqCard className="border-border bg-card">
          <FqText as="h1" className="text-lg font-semibold text-foreground">
            Nenhum exercício disponível para esta sessão
          </FqText>
        </FqCard>
        <FqButton onClick={() => history.push(studentRoutes.workouts)} variant="outline" tone="neutral">
          Voltar para Treinos
        </FqButton>
      </section>
    )
  }

  const remainingSets = Math.max(totalSets - completedSets, 0)
  const nextExercise = pendingExercises.find((exercise) => exercise.id !== activeExercise?.id) ?? null
  const activeExerciseDoneSets = activeExercise ? session.setsDoneByExerciseId[activeExercise.id] ?? 0 : 0
  const activeExerciseProgressPct = activeExercise
    ? Math.round((activeExerciseDoneSets / Math.max(activeExercise.sets, 1)) * 100)
    : 100
  const startedAtLabel = new Date(session.startedAt).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
  const canCompleteSession = isExecutionStarted && completedSets > 0
  const sessionStatus =
    session.status === 'completed'
      ? { label: 'Concluída', tone: 'success' as const }
      : completionPct >= 100
        ? { label: 'Pronta para finalizar', tone: 'success' as const }
        : isPaused
          ? { label: 'Pausada', tone: 'warning' as const }
          : isExecutionStarted
            ? { label: 'Em execução', tone: 'primary' as const }
            : { label: 'Pronta para iniciar', tone: 'neutral' as const }
  const focusEyebrow = !isExecutionStarted
    ? 'Preparação'
    : isPaused
      ? 'Sessão pausada'
      : isRestRunning
        ? 'Recuperação entre séries'
        : activeExercise
          ? 'Exercício atual'
          : 'Fechamento'
  const focusTitle = activeExercise
    ? activeExercise.name
    : !isExecutionStarted
      ? session.title
      : completionPct >= 100
        ? 'Tudo pronto para concluir'
        : 'Continue o treino'
  const focusDescription = activeExercise
    ? `${activeExercise.sets} séries x ${activeExercise.reps} repetições com pausa de ${activeExercise.restSec}s entre séries.`
    : !isExecutionStarted
      ? 'Confira carga, espaço e ritmo. Quando iniciar, o treino fica guiado série por série.'
      : completionPct >= 100
        ? 'Todas as séries já foram registradas. Feche a sessão para garantir a recompensa e o histórico do dia.'
        : 'Seu progresso segue salvo. Continue do ponto em que parou.'
  const quickActions = !isExecutionStarted
    ? [
        {
          id: 'start',
          label: 'Iniciar sessao',
          icon: 'play' as const,
          onClick: handleStartSession,
        },
        {
          id: 'back',
          label: 'Voltar',
          icon: 'arrowLeft' as const,
          tone: 'neutral' as const,
          onClick: () => history.push(studentRoutes.workouts),
        },
      ]
    : isPaused
      ? [
          {
            id: 'resume',
            label: 'Retomar sessao',
            icon: 'play' as const,
            tone: 'secondary' as const,
            onClick: handleTogglePauseResume,
          },
          {
            id: 'complete',
            label: 'Concluir sessao',
            icon: 'check' as const,
            tone: 'success' as const,
            disabled: !canCompleteSession,
            onClick: () => void handleCompleteSession(),
          },
          {
            id: 'back',
            label: 'Voltar',
            icon: 'arrowLeft' as const,
            tone: 'neutral' as const,
            onClick: () => history.push(studentRoutes.workouts),
          },
        ]
      : activeExercise
        ? [
            {
              id: 'mark-set',
              label: 'Concluir série',
              icon: 'check' as const,
              onClick: () => handleMarkSetDone(activeExercise.id),
            },
            {
              id: 'pause',
              label: 'Pausar',
              icon: 'clock' as const,
              tone: 'warning' as const,
              onClick: handleTogglePauseResume,
            },
            isRestRunning
              ? {
                  id: 'skip-rest',
                  label: 'Pular descanso',
                  icon: 'clock' as const,
                  tone: 'neutral' as const,
                  onClick: handleSkipRest,
                }
              : {
                  id: 'complete',
                  label: 'Concluir sessao',
                  icon: 'check' as const,
                  tone: 'success' as const,
                  disabled: !canCompleteSession,
                  onClick: () => void handleCompleteSession(),
                },
          ]
        : [
            {
              id: 'complete',
              label: 'Concluir sessao',
              icon: 'check' as const,
              tone: 'success' as const,
              disabled: !canCompleteSession,
              onClick: () => void handleCompleteSession(),
            },
            {
              id: 'back',
              label: 'Voltar',
              icon: 'arrowLeft' as const,
              tone: 'neutral' as const,
              onClick: () => history.push(studentRoutes.workouts),
            },
          ]

  return (
    <>
      <section className="fq-page-shell space-y-5">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <FqTag tone={sessionStatus.tone}>{sessionStatus.label}</FqTag>
              <FqTag tone="neutral">{formatCountLabel(completedExercises, 'exercício concluído', 'exercícios concluídos')}</FqTag>
              <FqTag tone="success">+{session.rewardStars} estrelas</FqTag>
            </div>

            <div className="space-y-1">
              <FqText as="h1" className="text-2xl font-semibold text-foreground md:text-3xl">
                Sessao de treino
              </FqText>
              <FqText as="p" className="max-w-3xl text-sm text-muted-foreground md:text-base">
                {session.title}. Fluxo limpo para manter foco no exercício atual, no progresso e no próximo passo.
              </FqText>
            </div>
          </div>

          <div className="rounded-[28px] border border-primary/18 bg-primary/8 px-5 py-4 shadow-[0_18px_40px_rgba(95,141,118,0.14)]">
            <FqText as="p" className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Progresso total
            </FqText>
            <FqText as="p" className="mt-2 text-3xl font-semibold leading-none text-foreground md:text-4xl">
              {completionPct}%
            </FqText>
            <FqText as="p" className="mt-1 text-sm text-muted-foreground">
              {completedSets}/{totalSets} séries concluídas
            </FqText>
          </div>
        </header>

        {errorMessage ? (
          <FqAlert tone="danger" title="Falha ao salvar a sessao">
            {errorMessage}
          </FqAlert>
        ) : null}

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.95fr)]">
          <div className="space-y-5">
            <FqCard className="border-primary/18 bg-[radial-gradient(circle_at_top_left,_rgba(95,141,118,0.22),_transparent_36%),radial-gradient(circle_at_bottom_right,_rgba(208,160,75,0.14),_transparent_34%),linear-gradient(180deg,_rgba(252,250,246,0.98),_rgba(245,241,232,0.9))]">
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.92fr)]">
                <div className="space-y-5">
                  <div className="space-y-3">
                    <FqText as="p" className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
                      {focusEyebrow}
                    </FqText>
                    <FqText as="p" className="text-sm font-medium text-muted-foreground">
                      {session.title}
                    </FqText>
                    <FqText as="h2" className="text-3xl font-semibold leading-tight text-foreground md:text-4xl">
                      {focusTitle}
                    </FqText>
                    <FqText as="p" className="max-w-2xl text-sm text-muted-foreground md:text-base">
                      {focusDescription}
                    </FqText>
                  </div>

                  {activeExercise ? (
                    <div className="flex flex-wrap gap-2">
                      <FqTag tone="secondary">{formatCountLabel(activeExerciseDoneSets, 'série', 'séries')} concluídas</FqTag>
                      <FqTag tone="neutral">{formatCountLabel(activeExercise.sets, 'série', 'séries')}</FqTag>
                      <FqTag tone="neutral">{activeExercise.reps} repetições</FqTag>
                      {activeExercise.muscleGroup ? <FqTag tone="neutral">{activeExercise.muscleGroup}</FqTag> : null}
                      {activeExercise.suggestedLoadKg ? <FqTag tone="neutral">{activeExercise.suggestedLoadKg} kg</FqTag> : null}
                      {activeExercise.equipment ? <FqTag tone="neutral">{activeExercise.equipment}</FqTag> : null}
                    </div>
                  ) : null}

                  {activeExercise?.note ? (
                    <div className="rounded-[24px] border border-border/70 bg-card/80 p-4">
                      <FqText as="p" className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Atenção
                      </FqText>
                      <FqText as="p" className="mt-2 text-sm text-foreground">
                        {activeExercise.note}
                      </FqText>
                    </div>
                  ) : null}

                  {isRestRunning ? (
                    <div className="rounded-[24px] border border-warning/26 bg-[linear-gradient(135deg,_rgba(196,141,77,0.18),_rgba(252,250,246,0.9))] p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                          <FqText as="p" className="text-sm font-semibold text-foreground">
                            Descanso em andamento
                          </FqText>
                          <FqText as="p" className="text-sm text-muted-foreground">
                            Respire, recupere e siga para a próxima série quando estiver pronto.
                          </FqText>
                        </div>
                        <FqText as="p" className="text-3xl font-semibold leading-none text-foreground md:text-4xl">
                          {formatSeconds(restRemainingSec)}
                        </FqText>
                      </div>
                    </div>
                  ) : null}

                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    {!isExecutionStarted ? (
                      <FqButton onClick={handleStartSession} leftIcon="play" className="sm:min-w-[220px]">
                        Iniciar sessao
                      </FqButton>
                    ) : isPaused ? (
                      <FqButton onClick={handleTogglePauseResume} tone="secondary" leftIcon="play" className="sm:min-w-[220px]">
                        Retomar sessao
                      </FqButton>
                    ) : activeExercise ? (
                      <FqButton
                        onClick={() => handleMarkSetDone(activeExercise.id)}
                        leftIcon="check"
                        className="sm:min-w-[220px]"
                      >
                        Concluir série
                      </FqButton>
                    ) : (
                      <FqButton
                        onClick={handleCompleteSession}
                        tone="success"
                        leftIcon="check"
                        isDisabled={!canCompleteSession}
                        className="sm:min-w-[220px]"
                      >
                        Concluir sessao
                      </FqButton>
                    )}

                    {isExecutionStarted && !isPaused ? (
                      <FqButton onClick={handleTogglePauseResume} variant="outline" tone="warning">
                        Pausar
                      </FqButton>
                    ) : null}

                    {isRestRunning && !isPaused ? (
                      <FqButton onClick={handleSkipRest} variant="outline" tone="neutral">
                        Pular descanso
                      </FqButton>
                    ) : null}

                    {canCompleteSession && (activeExercise || isPaused) ? (
                      <FqButton onClick={handleCompleteSession} variant="outline" tone="success" leftIcon="check">
                        Concluir sessao
                      </FqButton>
                    ) : null}

                    <FqButton variant="ghost" tone="neutral" onClick={() => history.push(studentRoutes.workouts)}>
                      Voltar
                    </FqButton>
                  </div>
                </div>

                <div className="space-y-4 rounded-[28px] border border-border/75 bg-card/82 p-4 shadow-[0_18px_38px_rgba(36,49,44,0.06)] md:p-5">
                  <div className="space-y-3">
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <FqText as="p" className="text-sm font-semibold text-foreground">
                          Progresso da sessão
                        </FqText>
                        <FqText as="p" className="text-sm text-muted-foreground">
                          {completedSets}/{totalSets} séries registradas
                        </FqText>
                      </div>
                      <FqText as="p" className="text-3xl font-semibold leading-none text-foreground">
                        {completionPct}%
                      </FqText>
                    </div>
                    <FqProgressBar value={completionPct} tone={completionPct >= 100 ? 'success' : 'primary'} showLabel={false} />
                  </div>

                  {activeExercise ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="font-semibold text-foreground">Exercício atual</span>
                        <span className="text-muted-foreground">
                          {activeExerciseDoneSets}/{activeExercise.sets} séries
                        </span>
                      </div>
                      <FqProgressBar value={activeExerciseProgressPct} tone="secondary" showLabel={false} />
                    </div>
                  ) : null}

                  <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                    <div className="rounded-[22px] border border-border/70 bg-background/70 p-4">
                      <FqText as="p" className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Restam
                      </FqText>
                      <FqText as="p" className="mt-2 text-2xl font-semibold leading-none text-foreground">
                        {remainingSets}
                      </FqText>
                      <FqText as="p" className="mt-1 text-sm text-muted-foreground">
                        séries para fechar o treino
                      </FqText>
                    </div>

                    <div className="rounded-[22px] border border-border/70 bg-background/70 p-4">
                      <FqText as="p" className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Tempo
                      </FqText>
                      <FqText as="p" className="mt-2 text-2xl font-semibold leading-none text-foreground">
                        {formatSeconds(session.totalElapsedSec)}
                      </FqText>
                      <FqText as="p" className="mt-1 text-sm text-muted-foreground">
                        sessão ativa
                      </FqText>
                    </div>

                    <div className="rounded-[22px] border border-border/70 bg-background/70 p-4">
                      <FqText as="p" className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Próximo
                      </FqText>
                      <FqText as="p" className="mt-2 text-lg font-semibold leading-tight text-foreground">
                        {nextExercise ? nextExercise.name : completionPct >= 100 ? 'Concluir sessão' : 'Continue o foco'}
                      </FqText>
                      <FqText as="p" className="mt-1 text-sm text-muted-foreground">
                        {nextExercise
                          ? `${nextExercise.sets} séries x ${nextExercise.reps} repetições`
                          : completionPct >= 100
                            ? 'todas as séries já foram registradas'
                            : 'sem troca imediata na fila'}
                      </FqText>
                    </div>
                  </div>
                </div>
              </div>
            </FqCard>

            <FqCard className="border-border bg-card">
              <div className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <FqText as="h2" className="text-xl font-semibold text-foreground">
                      Fila do treino
                    </FqText>
                    <FqText as="p" className="text-sm text-muted-foreground">
                      Ordem enxuta para você saber o que já foi, o que está em foco e o que vem depois.
                    </FqText>
                  </div>

                  <FqTag tone={remainingSets === 0 ? 'success' : 'neutral'}>
                    {remainingSets === 0
                      ? 'Todas as séries registradas'
                      : `${formatCountLabel(remainingSets, 'série', 'séries')} restantes`}
                  </FqTag>
                </div>

                <div className="space-y-3">
                  {session.exercises.map((exercise) => (
                    <WorkoutExecutionExerciseCard
                      key={exercise.id}
                      exercise={exercise}
                      doneSets={session.setsDoneByExerciseId[exercise.id] ?? 0}
                      isActive={exercise.id === session.currentExerciseId}
                      isPaused={isPaused}
                      isLocked={!isExecutionStarted || session.status === 'completed'}
                      onFocus={() => handleFocusExercise(exercise.id)}
                    />
                  ))}
                </div>
              </div>
            </FqCard>
          </div>

          <div className="self-start xl:sticky xl:top-6">
            <FqCard className="border-success/18 bg-[radial-gradient(circle_at_top_right,_rgba(77,135,107,0.16),_transparent_34%),linear-gradient(180deg,_rgba(252,250,246,0.96),_rgba(245,241,232,0.92))]">
              <div className="space-y-4">
                <div className="space-y-1">
                  <FqText as="h2" className="text-lg font-semibold text-foreground">
                    Resumo rápido
                  </FqText>
                  <FqText as="p" className="text-sm text-muted-foreground">
                    Contexto suficiente para manter constância, ação e fechamento sem excesso de informação.
                  </FqText>
                </div>

                <div className="rounded-[24px] border border-success/18 bg-success/8 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <FqText as="p" className="text-xs font-semibold uppercase tracking-[0.14em] text-success">
                        Constância
                      </FqText>
                      <FqText as="p" className="mt-1 text-sm text-foreground">
                        {completedExercises > 0
                          ? `${formatCountLabel(completedExercises, 'exercício fechado', 'exercícios fechados')} hoje.`
                          : 'A primeira série concluída já conta para o ritmo do dia.'}
                      </FqText>
                    </div>
                    <FqTag tone="success">+{session.rewardStars}</FqTag>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="rounded-[22px] border border-border/70 bg-background/72 p-4">
                    <FqText as="p" className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Início
                    </FqText>
                    <FqText as="p" className="mt-2 text-lg font-semibold leading-none text-foreground">
                      {startedAtLabel}
                    </FqText>
                    <FqText as="p" className="mt-1 text-sm text-muted-foreground">
                      Tudo o que você marcar fica salvo em tempo real.
                    </FqText>
                  </div>

                  <div className="rounded-[22px] border border-border/70 bg-background/72 p-4">
                    <FqText as="p" className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Estado atual
                    </FqText>
                    <FqText as="p" className="mt-2 text-lg font-semibold leading-tight text-foreground">
                      {sessionStatus.label}
                    </FqText>
                    <FqText as="p" className="mt-1 text-sm text-muted-foreground">
                      {isPaused
                        ? 'Retome quando estiver pronto.'
                        : isExecutionStarted
                          ? 'O fluxo segue no exercício atual.'
                          : 'Basta iniciar para entrar no modo execução.'}
                    </FqText>
                  </div>

                  <div className="rounded-[22px] border border-border/70 bg-background/72 p-4">
                    <FqText as="p" className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Próxima transição
                    </FqText>
                    <FqText as="p" className="mt-2 text-lg font-semibold leading-tight text-foreground">
                      {nextExercise ? nextExercise.name : completionPct >= 100 ? 'Concluir sessão' : 'Sem troca imediata'}
                    </FqText>
                    <FqText as="p" className="mt-1 text-sm text-muted-foreground">
                      {nextExercise
                        ? `${nextExercise.sets} séries x ${nextExercise.reps} repetições com pausa de ${nextExercise.restSec}s.`
                        : completionPct >= 100
                          ? 'Seu próximo passo é fechar o treino.'
                          : 'Continue avançando na execução atual.'}
                    </FqText>
                  </div>

                  <div className="rounded-[22px] border border-border/70 bg-background/72 p-4">
                    <FqText as="p" className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Descanso
                    </FqText>
                    <FqText as="p" className="mt-2 text-lg font-semibold leading-none text-foreground">
                      {isRestRunning ? formatSeconds(restRemainingSec) : 'Livre'}
                    </FqText>
                    <FqText as="p" className="mt-1 text-sm text-muted-foreground">
                      {isRestRunning ? 'Contagem ativa para a próxima série.' : 'Nenhuma contagem ativa agora.'}
                    </FqText>
                  </div>
                </div>
              </div>
            </FqCard>
          </div>
        </div>
      </section>

      <FqQuickActions actions={quickActions} />
    </>
  )
}
