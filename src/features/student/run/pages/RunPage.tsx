import { useMemo, useState } from 'react'
import { useHistory } from 'react-router-dom'

import { studentRoutes } from '@/features/student/routes'
import { StudentModuleState, StudentPageHeader } from '@/features/student/components'
import { FqAlert, FqCard, FqQuickActions, FqStatCard, FqTag, FqText, useToast } from '@/shared/ui'
import type { RunActivityType } from '@/shared/services/contracts/run'

import { CardioHeroCard, CardioHistoryCard } from '../components'
import { useRunDashboard } from '../hooks/useRunDashboard'

function formatPace(paceSecPerKm: number | null) {
  if (!paceSecPerKm || paceSecPerKm <= 0) {
    return '--:-- /km'
  }

  const minutes = Math.floor(paceSecPerKm / 60)
  const seconds = paceSecPerKm % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} /km`
}

export function RunPage() {
  const history = useHistory()
  const { toast } = useToast()
  const {
    overview,
    ranking,
    isLoading,
    isError,
    error,
    refresh,
    startRun,
    isStartingRun,
  } = useRunDashboard()
  const [selectedActivityType, setSelectedActivityType] = useState<RunActivityType>('run')

  const latestHistory = useMemo(() => overview?.history ?? [], [overview?.history])

  async function handleStart() {
    try {
      const session = await startRun({ activityType: selectedActivityType })
      history.push(studentRoutes.cardioSession, { activityType: session.activityType })
    } catch (requestError) {
      toast({
        title: 'Falha ao iniciar atividade',
        description: requestError instanceof Error ? requestError.message : 'Tente novamente.',
        tone: 'danger',
      })
    }
  }

  function handleResume() {
    history.push(studentRoutes.cardioSession)
  }

  function handleOpenSummary(sessionId: string) {
    history.push(`${studentRoutes.cardioSummaryBase}/${sessionId}`)
  }

  if (isLoading) {
    return (
      <StudentModuleState
        state="loading"
        title="Preparando seu painel de cardio"
        description="Estamos juntando historico, ranking e progresso do dia para voce iniciar sem friccao."
      />
    )
  }

  if (isError || !overview) {
    return (
      <StudentModuleState
        state="error"
        tone="danger"
        title="Falha ao carregar cardio"
        description={error instanceof Error ? error.message : 'Nao foi possivel carregar seus dados de cardio.'}
        actionLabel="Tentar novamente"
        onAction={() => void refresh()}
      />
    )
  }

  return (
    <>
      <section className="fq-page-shell space-y-5">
        <StudentPageHeader
          eyebrow="Cardio do aluno"
          title="Corrida e caminhada"
          description="Cardio tratado como parte real da rotina: execução rápida, histórico claro e impacto visível em progresso, streak e estrelas."
          tags={[
            {
              id: 'today-cardio',
              label: `${overview.todayDistanceKm.toFixed(2)} km hoje`,
              tone: overview.todayDistanceKm > 0 ? 'success' : 'neutral',
              icon: 'mapPin',
            },
            {
              id: 'streak-cardio',
              label: `${overview.streakDays} dias de ritmo`,
              tone: overview.streakDays > 0 ? 'secondary' : 'neutral',
              icon: 'flame',
            },
          ]}
        />

        {overview.activeSession ? (
          <FqAlert tone="secondary" title="Atividade em andamento">
            <div className="space-y-3">
              <p>
                Sua {overview.activeSession.activityType === 'run' ? 'corrida' : 'caminhada'} está salva com
                {` ${overview.activeSession.distanceKm.toFixed(2)} km`} até agora.
              </p>
              <FqButton size="sm" variant="outline" tone="neutral" onClick={handleResume}>
                Retomar atividade
              </FqButton>
            </div>
          </FqAlert>
        ) : null}

        <CardioHeroCard
          overview={overview}
          selectedActivityType={selectedActivityType}
          onSelectActivityType={setSelectedActivityType}
          onStart={() => void handleStart()}
          onResume={overview.activeSession ? handleResume : undefined}
          isStarting={isStartingRun}
        />

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <FqStatCard label="Km no mês" value={`${overview.metrics.totalKmMonth.toFixed(2)} km`} icon="mapPin" />
          <FqStatCard label="Melhor ritmo" value={formatPace(overview.metrics.bestPaceSecPerKm)} icon="activity" />
          <FqStatCard label="Estrelas na semana" value={overview.metrics.weeklyStars} icon="star" />
          <FqStatCard
            label="Ranking cardio"
            value={`#${ranking?.position ?? '--'}`}
            helperText={`${ranking?.points ?? 0} pts entre ${ranking?.totalAthletes ?? 0} atletas`}
            icon="trophy"
          />
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.9fr)]">
          <CardioHistoryCard history={latestHistory} onOpenSummary={handleOpenSummary} />

          <FqCard className="border-border bg-card">
            <div className="space-y-4">
              <div>
                <FqText as="h2" className="text-lg font-semibold text-foreground">
                  Cardio e progresso diário
                </FqText>
                <FqText as="p" className="text-sm text-muted-foreground">
                  Corrida e caminhada puxam gamificação, progresso do dia e consistência semanal.
                </FqText>
              </div>

              <div className="flex flex-wrap gap-2">
                <FqTag tone="secondary">{overview.todayDistanceKm.toFixed(2)} km hoje</FqTag>
                <FqTag tone="success">+{overview.todayStars} estrelas hoje</FqTag>
                <FqTag tone="neutral">Streak cardio: {overview.streakDays} dias</FqTag>
              </div>

              <div className="rounded-2xl bg-muted/35 p-4">
                <FqText as="p" className="text-sm text-muted-foreground">
                  A base de dados já está pronta para tracking real com geolocalização e sensores via Capacitor. Por enquanto, a atividade funciona em modo manual, sem acoplar a UI ao provider nativo.
                </FqText>
              </div>
            </div>
          </FqCard>
        </div>
      </section>

      <FqQuickActions
        actions={[
          overview.activeSession
            ? {
                id: 'resume-cardio',
                label: 'Retomar cardio',
                icon: 'play' as const,
                onClick: handleResume,
              }
            : {
                id: 'start-cardio',
                label: selectedActivityType === 'run' ? 'Comecar corrida' : 'Comecar caminhada',
                icon: 'mapPin' as const,
                onClick: () => void handleStart(),
              },
          {
            id: 'latest-summary',
            label: 'Último resumo',
            icon: 'chart' as const,
            tone: 'neutral' as const,
            onClick: () => {
              const latest = latestHistory[0]
              if (latest) {
                handleOpenSummary(latest.sessionId)
              }
            },
            disabled: latestHistory.length === 0,
          },
        ]}
      />
    </>
  )
}
