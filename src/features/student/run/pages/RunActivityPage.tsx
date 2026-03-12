import { useEffect, useMemo, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'

import { studentRoutes } from '@/features/student/routes'
import { StudentModuleState } from '@/features/student/components'
import { invalidateStudentExperienceQueries } from '@/features/student/hooks/invalidateStudentExperienceQueries'
import { runService, type RunSession } from '@/shared/services'
import { FqAlert, FqButton, FqCard, FqProgressBar, FqQuickActions, FqStatCard, FqTag, FqText, useToast } from '@/shared/ui'

type ActivityLocationState = {
  activityType?: RunSession['activityType']
}

type ActivityUiState = 'loading' | 'ready' | 'error'

function formatDuration(totalSec: number) {
  const hours = Math.floor(totalSec / 3600)
  const minutes = Math.floor((totalSec % 3600) / 60)
  const seconds = totalSec % 60

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function formatPace(paceSecPerKm: number) {
  if (paceSecPerKm <= 0) {
    return '--:-- /km'
  }

  const minutes = Math.floor(paceSecPerKm / 60)
  const seconds = paceSecPerKm % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} /km`
}

function getProgressPct(distanceKm: number, goalKm: number) {
  return Math.min(Math.round((distanceKm / Math.max(goalKm, 0.1)) * 100), 100)
}

export function RunActivityPage() {
  const history = useHistory()
  const location = useLocation<ActivityLocationState | undefined>()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const [uiState, setUiState] = useState<ActivityUiState>('loading')
  const [session, setSession] = useState<RunSession | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function loadSession() {
      setUiState('loading')
      setErrorMessage(null)

      try {
        const activeSession = await runService.startRun({ activityType: location.state?.activityType })

        if (!mounted) {
          return
        }

        setSession(activeSession)
        setUiState('ready')
      } catch (error) {
        if (!mounted) {
          return
        }

        setUiState('error')
        setErrorMessage(error instanceof Error ? error.message : 'Nao foi possivel carregar a atividade.')
      }
    }

    void loadSession()

    return () => {
      mounted = false
    }
  }, [location.state?.activityType])

  useEffect(() => {
    if (!session || session.status !== 'active') {
      return
    }

    const intervalId = window.setInterval(() => {
      setSession((currentSession) => {
        if (!currentSession || currentSession.status !== 'active') {
          return currentSession
        }

        const elapsedSec = currentSession.elapsedSec + 1
        const paceSecPerKm =
          currentSession.distanceKm > 0 ? Math.round(elapsedSec / Math.max(currentSession.distanceKm, 0.01)) : 0

        return {
          ...currentSession,
          elapsedSec,
          paceSecPerKm,
        }
      })
    }, 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [session?.status])

  const goalKm = 4
  const progressPct = getProgressPct(session?.distanceKm ?? 0, goalKm)
  const statusLabel =
    session?.status === 'paused'
      ? 'Pausada'
      : session?.status === 'completed'
        ? 'Concluída'
        : 'Em andamento'

  const distanceSteps = useMemo(() => [0.25, 0.5, 1], [])

  async function refreshQueries() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['run'] }),
      invalidateStudentExperienceQueries(queryClient, { includeNutrition: false }),
    ])
  }

  async function persist(nextSession: RunSession) {
    setSession(nextSession)

    try {
      const updated = await runService.updateRunProgress(nextSession)
      setSession(updated)
      await refreshQueries()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Falha ao salvar atividade.')
      toast({
        title: 'Falha ao salvar atividade',
        description: 'Seu cardio continua aberto. Tente novamente em alguns segundos.',
        tone: 'danger',
      })
    }
  }

  function handleTogglePause() {
    if (!session) {
      return
    }

    const nextStatus = session.status === 'paused' ? 'active' : 'paused'
    void persist({
      ...session,
      status: nextStatus,
    })
    toast({
      title: nextStatus === 'paused' ? 'Atividade pausada' : 'Atividade retomada',
      description: nextStatus === 'paused' ? 'Seu progresso ficou salvo.' : 'Continue acumulando distância.',
      tone: 'secondary',
    })
  }

  function handleAddDistance(stepKm: number) {
    if (!session || session.status !== 'active') {
      return
    }

    const nextDistanceKm = Number((session.distanceKm + stepKm).toFixed(2))
    const nextSession: RunSession = {
      ...session,
      distanceKm: nextDistanceKm,
      calories: Math.max(Math.round(nextDistanceKm * (session.activityType === 'run' ? 68 : 52)), 0),
      paceSecPerKm: nextDistanceKm > 0 ? Math.round(session.elapsedSec / Math.max(nextDistanceKm, 0.01)) : 0,
    }

    void persist(nextSession)
  }

  async function handleFinish() {
    if (!session || session.distanceKm <= 0) {
      toast({
        title: 'Distância insuficiente',
        description: 'Registre ao menos algum deslocamento para finalizar a atividade.',
        tone: 'warning',
      })
      return
    }

    try {
      const completed = await runService.finishRun(session)
      await refreshQueries()
      history.replace(`${studentRoutes.cardioSummaryBase}/${completed.sessionId}`, {
        session: completed,
      })
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Falha ao finalizar atividade.')
      toast({
        title: 'Falha ao finalizar atividade',
        description: error instanceof Error ? error.message : 'Tente novamente.',
        tone: 'danger',
      })
    }
  }

  if (uiState === 'loading') {
    return <StudentModuleState state="loading" title="Preparando atividade" description="Abrindo seu tracking de cardio e deixando o fluxo pronto para pausar, retomar e concluir." />
  }

  if (uiState === 'error' || !session) {
    return (
      <StudentModuleState
        state="error"
        tone="danger"
        title="Falha ao abrir atividade"
        description={errorMessage ?? 'Nao foi possivel abrir sua atividade de cardio.'}
        actionLabel="Voltar para cardio"
        onAction={() => history.push(studentRoutes.cardio)}
      />
    )
  }

  return (
    <>
      <section className="fq-page-shell space-y-5">
        <header className="space-y-2">
          <FqText as="h1" className="text-2xl font-semibold text-foreground">
            {session.activityType === 'run' ? 'Corrida em andamento' : 'Caminhada em andamento'}
          </FqText>
          <FqText as="p" className="text-sm text-muted-foreground">
            Acompanhe tempo, distância, ritmo e calorias. A estrutura já está pronta para geolocalização e sensores nativos.
          </FqText>
        </header>

        <FqCard className="border-border bg-card">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <FqText as="p" className="text-sm text-muted-foreground">
                  Tracking {session.source === 'manual' ? 'manual' : 'por GPS'}
                </FqText>
                <FqText as="h2" className="text-xl font-semibold text-foreground">
                  {statusLabel}
                </FqText>
              </div>
              <FqTag tone={session.status === 'paused' ? 'warning' : 'secondary'}>
                {session.activityType === 'run' ? 'Corrida' : 'Caminhada'}
              </FqTag>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <FqStatCard label="Tempo" value={formatDuration(session.elapsedSec)} icon="clock" />
              <FqStatCard label="Distância" value={`${session.distanceKm.toFixed(2)} km`} icon="mapPin" />
              <FqStatCard label="Ritmo médio" value={formatPace(session.paceSecPerKm)} icon="activity" />
              <FqStatCard label="Calorias" value={`${session.calories} kcal`} icon="flame" />
              <FqStatCard label="Status" value={statusLabel} icon="target" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <FqText as="p" className="text-sm text-muted-foreground">
                  Meta sugerida do dia
                </FqText>
                <FqText as="p" className="text-sm font-semibold text-foreground">
                  {session.distanceKm.toFixed(2)} / {goalKm.toFixed(1)} km
                </FqText>
              </div>
              <FqProgressBar value={progressPct} tone="primary" showLabel />
            </div>

            <div className="flex flex-wrap gap-2">
              <FqButton onClick={handleTogglePause} tone={session.status === 'paused' ? 'secondary' : 'warning'}>
                {session.status === 'paused' ? 'Retomar atividade' : 'Pausar atividade'}
              </FqButton>
              <FqButton onClick={handleFinish} tone="success" leftIcon="check">
                Finalizar atividade
              </FqButton>
              <FqButton variant="outline" tone="neutral" onClick={() => history.push(studentRoutes.cardio)}>
                Voltar
              </FqButton>
            </div>
          </div>
        </FqCard>

        <FqAlert tone="neutral" title="Atualização de distância">
          Use os incrementos rápidos para registrar o deslocamento enquanto o tracking nativo ainda não está conectado.
        </FqAlert>

        <div className="grid gap-3 sm:grid-cols-3">
          {distanceSteps.map((stepKm) => (
            <FqButton
              key={stepKm}
              variant="outline"
              tone="neutral"
              onClick={() => handleAddDistance(stepKm)}
              isDisabled={session.status !== 'active'}
            >
              +{stepKm.toFixed(2)} km
            </FqButton>
          ))}
        </div>
      </section>

      <FqQuickActions
        actions={[
          {
            id: 'pause-resume-cardio',
            label: session.status === 'paused' ? 'Retomar atividade' : 'Pausar atividade',
            icon: session.status === 'paused' ? ('play' as const) : ('clock' as const),
            tone: 'warning' as const,
            onClick: handleTogglePause,
          },
          {
            id: 'add-distance',
            label: '+0.25 km',
            icon: 'plus' as const,
            tone: 'secondary' as const,
            onClick: () => handleAddDistance(0.25),
            disabled: session.status !== 'active',
          },
          {
            id: 'finish-cardio',
            label: 'Finalizar cardio',
            icon: 'check' as const,
            tone: 'success' as const,
            onClick: () => void handleFinish(),
          },
        ]}
      />
    </>
  )
}
