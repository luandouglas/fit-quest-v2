import { FqAlert, FqButton, FqCard, FqTag, FqText } from '@/shared/ui'
import type { NotificationPushState } from '@/shared/services/contracts/notifications'

type ProfileNotificationsCardProps = {
  headline: string
  supportLabel: string
  unreadCount: number
  reminderCount: number
  celebrationCount: number
  pushState: NotificationPushState
  onOpenInbox: () => void
}

function getPushTagTone(permission: NotificationPushState['permission']) {
  if (permission === 'granted') {
    return 'success'
  }

  if (permission === 'denied') {
    return 'danger'
  }

  if (permission === 'prompt') {
    return 'primary'
  }

  return 'neutral'
}

function getPushTagLabel(permission: NotificationPushState['permission']) {
  if (permission === 'granted') {
    return 'Push pronto'
  }

  if (permission === 'denied') {
    return 'Push bloqueado'
  }

  if (permission === 'prompt') {
    return 'Push disponivel'
  }

  return 'Push indisponivel'
}

export function ProfileNotificationsCard({
  headline,
  supportLabel,
  unreadCount,
  reminderCount,
  celebrationCount,
  pushState,
  onOpenInbox,
}: ProfileNotificationsCardProps) {
  return (
    <FqCard
      title="Alertas, lembretes e notificacoes"
      subtitle="Preferencias do perfil e sinais da rotina consumindo a mesma camada contextual."
      className="border-border bg-card"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <FqTag tone={unreadCount > 0 ? 'primary' : 'success'}>{unreadCount} nao lida(s)</FqTag>
          <FqTag tone={reminderCount > 0 ? 'warning' : 'neutral'}>{reminderCount} lembrete(s)</FqTag>
          <FqTag tone="success">{celebrationCount} celebracao(oes)</FqTag>
          <FqTag tone={getPushTagTone(pushState.permission)}>{getPushTagLabel(pushState.permission)}</FqTag>
        </div>

        <div className="rounded-[calc(var(--radius)+4px)] border border-border/75 bg-muted/10 p-4">
          <FqText as="p" className="text-sm font-semibold text-foreground">
            {headline}
          </FqText>
          <FqText as="p" className="mt-1 text-sm text-muted-foreground">
            {supportLabel}
          </FqText>
        </div>

        <FqAlert tone={reminderCount > 0 ? 'warning' : 'primary'} title="Coerencia entre rotina e notificacao">
          O aluno recebe apenas sinais que ajudam a agir, proteger streak, registrar progresso ou reconhecer evolucao.
        </FqAlert>

        <div className="flex flex-wrap gap-2">
          <FqButton variant="outline" tone="neutral" onClick={onOpenInbox}>
            Abrir central de alertas
          </FqButton>
        </div>
      </div>
    </FqCard>
  )
}
