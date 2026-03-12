import { FqButton, FqCard, FqEmptyState, FqIcon, FqTag, FqText } from '@/shared/ui'
import type { FqTone, IconName } from '@/shared/ui'

export type StudentContextAlertItem = {
  id: string
  title: string
  description: string
  tone: FqTone
  icon?: IconName
  actionLabel?: string
  actionRoute?: string
  metaLabel?: string
  tagLabel?: string
}

type StudentAlertsCardProps = {
  alerts: StudentContextAlertItem[]
  onNavigate: (path: string) => void
  onOpenInbox?: () => void
}

export function StudentAlertsCard({ alerts, onNavigate, onOpenInbox }: StudentAlertsCardProps) {
  return (
    <FqCard className="border-border bg-card">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <FqText as="h2" className="text-base font-semibold text-foreground">
              Alertas úteis de hoje
            </FqText>
            <FqText as="p" className="text-sm text-muted-foreground">
              Sinais rápidos do que precisa de atenção agora.
            </FqText>
          </div>
          {onOpenInbox ? (
            <FqButton variant="ghost" tone="neutral" size="sm" onClick={onOpenInbox}>
              Abrir inbox
            </FqButton>
          ) : null}
        </div>

        {alerts.length === 0 ? (
          <FqEmptyState
            icon="check"
            title="Nada urgente por agora"
            description="Seu dia está sob controle. Continue executando para manter o streak."
          />
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="rounded-[calc(var(--radius)+6px)] border border-border/75 bg-background/70 p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-card">
                    <FqIcon name={alert.icon ?? 'bell'} size={18} className="text-foreground" />
                  </div>

                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <FqTag tone={alert.tone}>{alert.tagLabel ?? 'Hoje'}</FqTag>
                      {alert.metaLabel ? <FqTag tone="neutral">{alert.metaLabel}</FqTag> : null}
                    </div>

                    <div>
                      <FqText as="p" className="text-sm font-semibold text-foreground">
                        {alert.title}
                      </FqText>
                      <FqText as="p" className="mt-1 text-sm text-muted-foreground">
                        {alert.description}
                      </FqText>
                    </div>

                    {alert.actionRoute ? (
                      <FqButton variant="ghost" tone="neutral" size="sm" onClick={() => onNavigate(alert.actionRoute!)}>
                        {alert.actionLabel ?? 'Abrir'}
                      </FqButton>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </FqCard>
  )
}
