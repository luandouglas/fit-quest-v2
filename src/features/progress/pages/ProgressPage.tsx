import { useMemo } from 'react'

import { FqAlert, FqButton, FqCard, FqEmptyState, FqProgressBar, FqTag, FqText } from '@/shared/ui'

import { useProgressOverview } from '../hooks/useProgressOverview'

function formatWeekday(isoDate: string) {
  const date = new Date(`${isoDate}T00:00:00`)
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(date).slice(0, 3)
}

function formatDuration(durationSec: number) {
  const minutes = Math.max(Math.round(durationSec / 60), 1)
  return `${minutes} min`
}

export function ProgressPage() {
  const { overview, uiState, refresh, error } = useProgressOverview()

  const weeklyGoalPct = useMemo(() => {
    if (!overview) {
      return 0
    }

    return Math.round((overview.weeklySummary.completedTrainings / Math.max(overview.weeklySummary.targetTrainings, 1)) * 100)
  }, [overview])

  if (uiState === 'loading') {
    return (
      <section className="mx-auto w-full max-w-6xl space-y-4 px-4 py-4 lg:px-0">
        <FqCard className="border-border bg-card">
          <FqText as="h1" variant="title" className="text-lg">
            Carregando progresso...
          </FqText>
        </FqCard>
      </section>
    )
  }

  if (uiState === 'error') {
    return (
      <section className="mx-auto w-full max-w-6xl space-y-4 px-4 py-4 lg:px-0">
        <FqAlert tone="danger" title="Falha ao carregar progresso">
          {error instanceof Error ? error.message : 'Nao foi possivel carregar os dados agora.'}
        </FqAlert>
        <FqButton onClick={() => void refresh()} variant="outline" tone="neutral">
          Tentar novamente
        </FqButton>
      </section>
    )
  }

  if (uiState === 'empty' || !overview) {
    return (
      <section className="mx-auto w-full max-w-6xl space-y-4 px-4 py-4 lg:px-0">
        <FqEmptyState
          icon="chart"
          title="Sem progresso registrado"
          description="Conclua seu primeiro treino para liberar grafico e historico da semana."
        />
      </section>
    )
  }

  const maxTrainings = Math.max(...overview.chart.map((point) => point.completedTrainings), 1)

  return (
    <section className="mx-auto w-full max-w-6xl space-y-4 px-4 py-4 lg:px-0">
      <header className="space-y-2">
        <FqText as="h1" variant="title" className="text-lg">
          Progresso
        </FqText>
        <FqText as="p" className="text-sm text-muted-foreground">
          Visao semanal dos treinos concluidos e historico recente.
        </FqText>
      </header>

      <div className="grid gap-4 lg:grid-cols-12">
        <FqCard className="border-border bg-card lg:col-span-7">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <FqTag tone="primary">{overview.weeklySummary.completedTrainings}/{overview.weeklySummary.targetTrainings} treinos</FqTag>
              <FqTag tone="neutral">{overview.weeklySummary.totalDurationMin} min acumulados</FqTag>
              <FqTag tone="success">{overview.weeklySummary.averageCompletionPct}% series concluidas</FqTag>
            </div>

            <FqProgressBar value={weeklyGoalPct} tone={weeklyGoalPct >= 100 ? 'success' : 'primary'} />

            <div className="rounded-xl border border-border bg-muted/20 p-3">
              <div className="flex h-28 items-end gap-2">
                {overview.chart.map((point) => {
                  const heightPct = Math.max(Math.round((point.completedTrainings / maxTrainings) * 100), point.completedTrainings > 0 ? 25 : 6)

                  return (
                    <div key={point.date} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                      <span className="text-xs text-muted-foreground">{point.completedTrainings}</span>
                      <div className="flex w-full items-end justify-center rounded-md bg-muted/50 px-1" style={{ height: '84px' }}>
                        <div
                          className="w-full rounded-sm bg-primary/80"
                          style={{ height: `${heightPct}%` }}
                          title={`${point.completedTrainings} treino(s)`}
                        />
                      </div>
                      <span className="text-[11px] uppercase text-muted-foreground">{formatWeekday(point.date)}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </FqCard>

        <FqCard className="border-border bg-card lg:col-span-5">
          <div className="space-y-3">
            <FqText as="h2" className="text-sm font-semibold text-foreground">
              Historico recente
            </FqText>

            {overview.recentHistory.length === 0 ? (
              <FqText as="p" className="text-sm text-muted-foreground">
                Nenhum treino concluido ainda nesta conta.
              </FqText>
            ) : (
              <ul className="space-y-2">
                {overview.recentHistory.map((entry) => (
                  <li key={entry.sessionId} className="rounded-lg border border-border bg-muted/20 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <FqText as="p" className="text-sm font-semibold text-foreground">
                        {entry.title}
                      </FqText>
                      <FqTag tone={entry.completedSets >= entry.totalSets ? 'success' : 'secondary'}>
                        {entry.completedSets}/{entry.totalSets} series
                      </FqTag>
                    </div>
                    <FqText as="p" className="mt-1 text-xs text-muted-foreground">
                      {new Intl.DateTimeFormat('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      }).format(new Date(entry.completedAt))}
                      {' - '}
                      {formatDuration(entry.durationSec)}
                    </FqText>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </FqCard>
      </div>
    </section>
  )
}
