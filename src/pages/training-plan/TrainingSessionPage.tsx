import { useEffect, useMemo, useState } from 'react'
import { useHistory } from 'react-router-dom'

import { FqAlert, FqButton, FqCard, FqModal, FqProgressBar, FqTag, FqText } from '@/shared/ui'
import { workoutService, type WorkoutSession, type WorkoutSessionSummary } from '@/shared/services'

type SessionUiState = 'loading' | 'ready' | 'error' | 'empty'

function formatSeconds(totalSeconds: number) {
  const safe = Math.max(totalSeconds, 0)
  const minutes = Math.floor(safe / 60)
  const seconds = safe % 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function TrainingSessionPage() {
  const history = useHistory()

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
        const activeSession = await workoutService.startSession()

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
  }, [])

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

  async function persistProgress(nextSession: WorkoutSession) {
    setSession(nextSession)

    try {
      await workoutService.saveSessionProgress(nextSession)
    } catch (error) {
      setUiState('error')
      setErrorMessage(error instanceof Error ? error.message : 'Falha ao salvar progresso da sessao.')
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
  }

  function handleSkipRest() {
    setIsRestRunning(false)
    setRestRemainingSec(0)
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
    } catch (error) {
      setUiState('error')
      setErrorMessage(error instanceof Error ? error.message : 'Nao foi possivel concluir a sessao.')
    }
  }

  if (uiState === 'loading') {
    return (
      <section className="mx-auto w-full max-w-5xl space-y-4 px-4 py-4 lg:px-0">
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
      <section className="mx-auto w-full max-w-5xl space-y-4 px-4 py-4 lg:px-0">
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
      <section className="mx-auto w-full max-w-5xl space-y-4 px-4 py-4 lg:px-0">
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
      <section className="mx-auto w-full max-w-6xl space-y-4 px-4 py-4 lg:px-0">
        <header className="space-y-3">
          <FqText as="h1" variant="title" className="text-lg">
            Sessao de treino
          </FqText>
          <FqText as="p" className="text-sm text-muted-foreground">
            Execute os exercicios, marque as series e conclua a sessao.
          </FqText>
        </header>

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

                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground md:grid-cols-4">
                  <p>Series: {completedSets}/{totalSets}</p>
                  <p>Exercicios: {completedExercises}/{session.exercises.length}</p>
                  <p>Tempo: {formatSeconds(session.totalElapsedSec)}</p>
                  <p>Descanso: {isRestRunning ? formatSeconds(restRemainingSec) : '--:--'}</p>
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
            <FqCard className="border-border bg-card">
              <div className="space-y-2">
                <FqText as="p" className="text-sm font-semibold text-foreground">
                  Painel da sessao
                </FqText>
                <FqText as="p" className="text-sm text-muted-foreground">
                  Acompanhe progresso e finalize quando concluir as series principais.
                </FqText>
              </div>
            </FqCard>

            <FqCard className="border-border bg-card">
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Iniciada: {new Date(session.startedAt).toLocaleTimeString()}</p>
                <p>Status: {session.status}</p>
                <p>Tempo total: {formatSeconds(session.totalElapsedSec)}</p>
              </div>
            </FqCard>
          </aside>
        </div>
      </section>

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
