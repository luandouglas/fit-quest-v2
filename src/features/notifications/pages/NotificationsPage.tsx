import { FqAlert, FqButton, FqCard, FqEmptyState, FqTag, FqText } from '@/shared/ui'

import { useNotificationsInbox } from '../hooks/useNotificationsInbox'

function formatDateTime(isoDate: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoDate))
}

export function NotificationsPage() {
  const { inbox, uiState, error, refresh, markAsRead, markAllAsRead, isMarkingAsRead, isMarkingAllAsRead } = useNotificationsInbox()

  if (uiState === 'loading') {
    return (
      <section className="fq-page-shell-narrow">
        <FqCard className="border-border bg-card">
          <FqText as="h1" variant="title" className="text-lg">
            Carregando notificacoes...
          </FqText>
        </FqCard>
      </section>
    )
  }

  if (uiState === 'error') {
    return (
      <section className="fq-page-shell-narrow">
        <FqAlert tone="danger" title="Falha ao carregar notificacoes">
          {error instanceof Error ? error.message : 'Nao foi possivel carregar sua inbox.'}
        </FqAlert>
        <FqButton variant="outline" tone="neutral" onClick={() => void refresh()}>
          Tentar novamente
        </FqButton>
      </section>
    )
  }

  if (uiState === 'empty' || !inbox) {
    return (
      <section className="fq-page-shell-narrow">
        <FqEmptyState icon="bell" title="Inbox vazia" description="Sem notificacoes no momento." />
      </section>
    )
  }

  return (
    <section className="fq-page-shell-narrow">
      <header className="fq-page-header">
        <FqText as="h1" variant="title" className="text-lg">
          Notificacoes
        </FqText>
        <div className="flex items-center justify-between gap-2">
          <FqText as="p" className="text-sm text-muted-foreground">
            {inbox.unreadCount} nao lida(s)
          </FqText>
          <FqButton
            size="sm"
            variant="outline"
            tone="neutral"
            onClick={() => void markAllAsRead()}
            isLoading={isMarkingAllAsRead}
            isDisabled={inbox.unreadCount === 0}
          >
            Marcar todas como lidas
          </FqButton>
        </div>
      </header>

      <div className="space-y-2">
        {inbox.items.map((item) => (
          <FqCard key={item.id} className={item.read ? 'border-border bg-card' : 'border-primary/30 bg-primary/10'}>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <FqText as="p" className="text-sm font-semibold text-foreground">
                  {item.title}
                </FqText>
                <FqTag tone={item.read ? 'neutral' : 'primary'}>{item.read ? 'Lida' : 'Nova'}</FqTag>
              </div>
              <FqText as="p" className="text-sm text-muted-foreground">
                {item.description}
              </FqText>
              <div className="flex items-center justify-between gap-2">
                <FqText as="p" className="text-xs text-muted-foreground">
                  {formatDateTime(item.at)}
                </FqText>
                {!item.read ? (
                  <FqButton
                    size="sm"
                    variant="outline"
                    tone="secondary"
                    onClick={() => void markAsRead(item.id)}
                    isLoading={isMarkingAsRead}
                  >
                    Marcar como lida
                  </FqButton>
                ) : null}
              </div>
            </div>
          </FqCard>
        ))}
      </div>
    </section>
  )
}

