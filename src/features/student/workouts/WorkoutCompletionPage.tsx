import { useMemo } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import { studentRoutes } from '@/features/student/routes'
import { workoutService, type WorkoutSessionSummary } from '@/shared/services'
import { FqAlert, FqButton, FqCard, FqLoadingSpinner, FqText } from '@/shared/ui'

import { WorkoutCompletionSummaryCard } from './components'

type CompletionLocationState = {
  summary?: WorkoutSessionSummary
}

function formatMinutes(totalSec: number) {
  return `${Math.max(Math.round(totalSec / 60), 1)} min`
}

export function WorkoutCompletionPage() {
  const history = useHistory()
  const location = useLocation<CompletionLocationState>()
  const locationSummary = location.state?.summary ?? null

  const summaryQuery = useQuery({
    queryKey: ['workouts', 'last-summary', locationSummary?.sessionId ?? 'latest'],
    queryFn: () => workoutService.getLastSessionSummary(),
    enabled: !locationSummary,
    staleTime: 15_000,
  })

  const summary = locationSummary ?? summaryQuery.data ?? null
  const weeklyImpactMessage = useMemo(() => {
    if (!summary) {
      return ''
    }

    if (summary.weeklyCompletionDelta <= 0) {
      return 'Você fechou a meta semanal de treinos.'
    }

    if (summary.weeklyCompletionDelta === 1) {
      return 'Falta só 1 treino para fechar sua meta semanal.'
    }

    return `Faltam ${summary.weeklyCompletionDelta} treinos para bater sua meta semanal.`
  }, [summary])

  if (!locationSummary && summaryQuery.isPending) {
    return (
      <section className="fq-page-shell-medium">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
          <FqLoadingSpinner size="md" />
          <FqText as="p" className="text-sm text-muted-foreground">
            Carregando conclusão do treino...
          </FqText>
        </div>
      </section>
    )
  }

  if (!summary) {
    return (
      <section className="fq-page-shell-medium space-y-4">
        <FqAlert tone="warning" title="Resumo indisponível">
          Não encontramos a conclusão desta sessão.
        </FqAlert>
        <FqButton variant="outline" tone="neutral" onClick={() => history.push(studentRoutes.workouts)}>
          Voltar para Treinos
        </FqButton>
      </section>
    )
  }

  return (
    <section className="fq-page-shell space-y-5">
      <WorkoutCompletionSummaryCard summary={summary} />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.9fr)]">
        <FqCard className="border-border bg-card">
          <div className="space-y-4">
            <div>
              <FqText as="h2" className="text-lg font-semibold text-foreground">
                Impacto desta sessão
              </FqText>
              <FqText as="p" className="text-sm text-muted-foreground">
                O treino já contou para sua semana, para sua streak e para o próximo nível.
              </FqText>
            </div>

            <FqAlert tone="success" title="Semana atualizada">
              {weeklyImpactMessage}
            </FqAlert>

            <ul className="space-y-3">
              {summary.exerciseRecords.map((record) => (
                <li key={record.exerciseId} className="rounded-2xl border border-border bg-background p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <FqText as="p" className="text-sm font-semibold text-foreground">
                        {record.exerciseName}
                      </FqText>
                      <FqText as="p" className="text-xs text-muted-foreground">
                        Volume registrado nesta sessão
                      </FqText>
                    </div>
                    <FqText as="p" className="text-sm font-semibold text-foreground">
                      {record.loadVolumeKg} kg
                    </FqText>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </FqCard>

        <FqCard className="border-border bg-card">
          <div className="space-y-4">
            <div>
              <FqText as="h2" className="text-lg font-semibold text-foreground">
                Fechamento do treino
              </FqText>
              <FqText as="p" className="text-sm text-muted-foreground">
                Tempo investido, séries registradas e próximo passo.
              </FqText>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Duração total: {formatMinutes(summary.durationSec)}</p>
              <p>Exercícios concluídos: {summary.completedExercises}/{summary.totalExercises}</p>
              <p>Séries concluídas: {summary.completedSets}/{summary.totalSets}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <FqButton onClick={() => history.push(studentRoutes.workouts)}>
                Voltar para Treinos
              </FqButton>
            </div>
          </div>
        </FqCard>
      </div>
    </section>
  )
}
