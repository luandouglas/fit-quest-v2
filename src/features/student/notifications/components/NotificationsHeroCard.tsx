import { FqAlert, FqCard, FqProgressBar, FqStatCard, FqTag, FqText } from '@/shared/ui'

import type { NotificationsCenterViewModel } from '../hooks/useNotificationsCenter'

type NotificationsHeroCardProps = {
  viewModel: NotificationsCenterViewModel
}

function getCoverageValue(viewModel: NotificationsCenterViewModel) {
  const totalSignals = Math.max(viewModel.inbox.length, 1)
  const actionableSignals = viewModel.reminders.length + viewModel.opportunities.length

  return Math.round(((totalSignals - actionableSignals) / totalSignals) * 100)
}

export function NotificationsHeroCard({ viewModel }: NotificationsHeroCardProps) {
  const coverageValue = getCoverageValue(viewModel)

  return (
    <FqCard className="overflow-hidden border-border bg-card">
      <div className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <FqTag tone={viewModel.contextSummary.unreadCount > 0 ? 'primary' : 'success'} leftIcon="bell">
              {viewModel.contextSummary.unreadCount > 0 ? `${viewModel.contextSummary.unreadCount} sinal(is) ativo(s)` : 'Rotina em paz'}
            </FqTag>
            <div>
              <FqText as="h1" variant="title">
                Alertas e lembretes
              </FqText>
              <FqText as="p" className="mt-1 text-sm text-muted-foreground">
                {viewModel.headline}
              </FqText>
              <FqText as="p" className="mt-1 text-sm text-muted-foreground">
                {viewModel.subheadline}
              </FqText>
            </div>
          </div>

          <div className="min-w-55 max-w-80 rounded-xl border border-border/70 bg-muted/10 p-4">
            <FqText as="p" className="fq-subtle-label">
              Cobertura da rotina
            </FqText>
            <FqText as="p" className="mt-2 text-card-title font-semibold text-foreground">
              {coverageValue}%
            </FqText>
            <FqText as="p" className="mt-1 text-xs text-muted-foreground">
              Quanto do seu dia ja esta protegido contra esquecimentos, lacunas e perda de streak.
            </FqText>
            <div className="mt-3">
              <FqProgressBar value={coverageValue} tone={coverageValue >= 80 ? 'success' : 'primary'} />
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <FqStatCard
            label="Nao lidas"
            value={viewModel.contextSummary.unreadCount}
            helperText="Entradas novas esperando sua leitura."
            icon="bell"
          />
          <FqStatCard
            label="Em risco"
            value={viewModel.contextSummary.criticalCount}
            helperText="Sinais que podem quebrar a rotina hoje."
            icon="flame"
          />
          <FqStatCard
            label="Atenção do dia"
            value={viewModel.contextSummary.attentionCount}
            helperText="Lembretes de execucao ainda em aberto."
            icon="target"
          />
          <FqStatCard
            label="Celebracoes"
            value={viewModel.contextSummary.celebrationCount}
            helperText="Ganhos recentes de nivel, conquista e aderencia."
            icon="star"
          />
        </div>

        {viewModel.spotlight ? (
          <FqAlert tone={viewModel.spotlight.tone} title={viewModel.spotlight.title}>
            {viewModel.spotlight.description}
          </FqAlert>
        ) : null}
      </div>
    </FqCard>
  )
}
