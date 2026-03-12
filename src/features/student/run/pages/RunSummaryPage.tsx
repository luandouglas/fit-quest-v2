import { useMemo } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import { studentRoutes } from '@/features/student/routes'
import { runService, type RunSession } from '@/shared/services'
import { FqAlert, FqButton, FqCard, FqLoadingSpinner, FqText } from '@/shared/ui'

import { CardioSummaryCard } from '../components'

type SummaryLocationState = {
  session?: RunSession
}

export function RunSummaryPage() {
  const history = useHistory()
  const location = useLocation<SummaryLocationState>()
  const locationSession = location.state?.session ?? null

  const summaryQuery = useQuery({
    queryKey: ['run', 'last-completed-summary'],
    queryFn: () => runService.getLastCompletedSession(),
    enabled: !locationSession,
    staleTime: 10_000,
  })

  const session = locationSession ?? summaryQuery.data ?? null
  const impactMessage = useMemo(() => {
    if (!session) {
      return ''
    }

    if (session.progressImpactPct >= 25) {
      return 'Seu cardio puxou forte o progresso do dia e já reforçou a consistência semanal.'
    }

    if (session.progressImpactPct >= 12) {
      return 'Boa sessão. O cardio ajudou a fechar o dia com mais solidez.'
    }

    return 'Sessão registrada. Mesmo um cardio curto conta para a jornada.'
  }, [session])

  if (!locationSession && summaryQuery.isPending) {
    return (
      <section className="fq-page-shell-medium">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
          <FqLoadingSpinner size="md" />
          <FqText as="p" className="text-sm text-muted-foreground">
            Carregando resumo do cardio...
          </FqText>
        </div>
      </section>
    )
  }

  if (!session) {
    return (
      <section className="fq-page-shell-medium space-y-4">
        <FqAlert tone="warning" title="Resumo indisponível">
          Não foi possível encontrar o fechamento desta atividade.
        </FqAlert>
        <FqButton variant="outline" tone="neutral" onClick={() => history.push(studentRoutes.cardio)}>
          Voltar para Cardio
        </FqButton>
      </section>
    )
  }

  return (
    <section className="fq-page-shell space-y-5">
      <CardioSummaryCard session={session} />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.9fr)]">
        <FqCard className="border-border bg-card">
          <div className="space-y-4">
            <div>
              <FqText as="h2" className="text-lg font-semibold text-foreground">
                Impacto no seu dia
              </FqText>
              <FqText as="p" className="text-sm text-muted-foreground">
                O cardio finalizado já alimentou progresso diário e recompensa.
              </FqText>
            </div>

            <FqAlert tone="success" title="Atividade registrada">
              {impactMessage}
            </FqAlert>

            <div className="rounded-2xl bg-muted/35 p-4">
              <FqText as="p" className="text-sm text-muted-foreground">
                Distância total: {session.distanceKm.toFixed(2)} km. Calorias estimadas: {session.calories} kcal. Impacto direto: {session.progressImpactPct}% no progresso do dia.
              </FqText>
            </div>
          </div>
        </FqCard>

        <FqCard className="border-border bg-card">
          <div className="space-y-4">
            <div>
              <FqText as="h2" className="text-lg font-semibold text-foreground">
                Próximo passo
              </FqText>
              <FqText as="p" className="text-sm text-muted-foreground">
                Continue acumulando cardio ou volte para o painel principal.
              </FqText>
            </div>

            <div className="flex flex-wrap gap-2">
              <FqButton onClick={() => history.push(studentRoutes.cardio)}>
                Voltar para Cardio
              </FqButton>
              <FqButton
                variant="outline"
                tone="neutral"
                onClick={() => history.push(studentRoutes.cardioSession, { activityType: session.activityType })}
              >
                Repetir atividade
              </FqButton>
            </div>
          </div>
        </FqCard>
      </div>
    </section>
  )
}
