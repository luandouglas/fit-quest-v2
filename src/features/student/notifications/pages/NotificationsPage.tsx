import { useHistory } from 'react-router-dom'

import { StudentModuleState, StudentPageHeader } from '@/features/student/components'
import { FqButton, FqEmptyState, FqTabs, FqText, useToast } from '@/shared/ui'

import {
  NotificationsHeroCard,
  NotificationsInboxSection,
  NotificationsPushReadinessCard,
} from '../components'
import { useNotificationsCenter } from '../hooks/useNotificationsCenter'

export function NotificationsPage() {
  const history = useHistory()
  const { toast } = useToast()
  const {
    uiState,
    error,
    refresh,
    markAsRead,
    markAllAsRead,
    isMarkingAsRead,
    isMarkingAllAsRead,
    viewModel,
    pushState,
    enablePush,
    isEnablingPush,
  } = useNotificationsCenter()

  async function handleMarkAsRead(notificationId: string) {
    try {
      await markAsRead(notificationId)
    } catch (requestError) {
      toast({
        title: 'Falha ao atualizar alerta',
        description: requestError instanceof Error ? requestError.message : 'Tente novamente.',
        tone: 'danger',
      })
    }
  }

  async function handleMarkAllAsRead() {
    try {
      await markAllAsRead()
    } catch (requestError) {
      toast({
        title: 'Falha ao limpar inbox',
        description: requestError instanceof Error ? requestError.message : 'Tente novamente.',
        tone: 'danger',
      })
    }
  }

  async function handleEnablePush() {
    try {
      const nextState = await enablePush()

      toast({
        title: nextState.permission === 'granted' ? 'Avisos prontos' : 'Permissao ainda pendente',
        description:
          nextState.permission === 'granted'
            ? 'Seu dispositivo ficou preparado para futuras notificacoes push.'
            : 'A estrutura continua pronta. Ajuste a permissao do dispositivo quando estiver disponivel.',
        tone: nextState.permission === 'granted' ? 'success' : 'warning',
      })
    } catch (requestError) {
      toast({
        title: 'Falha ao ativar avisos',
        description: requestError instanceof Error ? requestError.message : 'Tente novamente.',
        tone: 'danger',
      })
    }
  }

  if (uiState === 'loading') {
    return (
      <StudentModuleState
        state="loading"
        title="Carregando sinais da sua rotina"
        description="Estamos organizando lembretes, oportunidades e celebracoes para voce agir no que importa agora."
        shellClassName="fq-page-shell"
      />
    )
  }

  if (uiState === 'error') {
    return (
      <StudentModuleState
        state="error"
        tone="danger"
        title="Falha ao carregar notificacoes"
        description={error instanceof Error ? error.message : 'Nao foi possivel carregar sua central de alertas.'}
        actionLabel="Tentar novamente"
        onAction={() => void refresh()}
        shellClassName="fq-page-shell"
      />
    )
  }

  return (
    <section className="fq-page-shell space-y-5">
      <StudentPageHeader
        eyebrow="Alertas contextuais"
        title="Lembretes e notificações"
        description="Sinais úteis, acionáveis e coerentes com treino, nutrição, água, streak e progresso do aluno."
        tags={[
          {
            id: 'notifications-unread',
            label: `${viewModel.contextSummary.unreadCount} não lidas`,
            tone: viewModel.contextSummary.unreadCount > 0 ? 'warning' : 'success',
            icon: 'bell',
          },
          {
            id: 'notifications-push',
            label: pushState.permission === 'granted' ? 'Push preparado' : 'Push pendente',
            tone: pushState.permission === 'granted' ? 'secondary' : 'neutral',
            icon: 'info',
          },
        ]}
      />

      <NotificationsHeroCard viewModel={viewModel} />

      <div className="grid gap-5 xl:fq-grid-main-sidebar-tight">
        <div className="space-y-5">
          <div className="fq-shell-panel px-4 py-5 md:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <FqText as="p" className="fq-subtle-label">
                  Inbox do aluno
                </FqText>
                <FqText as="p" className="mt-1 text-sm text-muted-foreground">
                  Resolva primeiro o que protege streak, aderencia e consistencia de hoje.
                </FqText>
              </div>
              <FqButton
                size="sm"
                variant="outline"
                tone="neutral"
                onClick={() => void handleMarkAllAsRead()}
                isLoading={isMarkingAllAsRead}
                isDisabled={viewModel.contextSummary.unreadCount === 0}
              >
                Marcar tudo como lido
              </FqButton>
            </div>
          </div>

          {uiState === 'empty' ? (
            <div className="rounded-2xl border border-dashed border-border/70 bg-card/80 px-4 py-8">
              <FqEmptyState
                icon="check"
                title="Sem alertas ativos"
                description="Quando surgir algo relevante para treino, nutricao, agua, streak ou gamificacao, ele aparecera aqui."
              />
            </div>
          ) : (
            <FqTabs
              defaultValue="reminders"
              items={[
                {
                  value: 'reminders',
                  label: `Lembretes (${viewModel.reminders.length})`,
                  content: (
                    <NotificationsInboxSection
                      title="O que merece sua atencao agora"
                      description="Alertas mais sensiveis da rotina diaria, focados em aderencia e risco de quebra."
                      items={viewModel.reminders}
                      emptyTitle="Nenhum lembrete critico agora"
                      emptyDescription="Seu treino, alimentacao, agua e streak nao estao pedindo resposta imediata."
                      onOpen={(route) => history.push(route)}
                      onMarkAsRead={(notificationId) => void handleMarkAsRead(notificationId)}
                      isMarkingAsRead={isMarkingAsRead}
                    />
                  ),
                },
                {
                  value: 'opportunities',
                  label: `Oportunidades (${viewModel.opportunities.length})`,
                  content: (
                    <NotificationsInboxSection
                      title="Janelas boas para evoluir"
                      description="Sugestoes acionaveis que ajudam a fechar o dia melhor ou antecipar ganhos."
                      items={viewModel.opportunities}
                      emptyTitle="Sem oportunidades em aberto"
                      emptyDescription="Sua rotina esta bem distribuida. Novas sugestoes aparecem quando fizerem sentido."
                      onOpen={(route) => history.push(route)}
                      onMarkAsRead={(notificationId) => void handleMarkAsRead(notificationId)}
                      isMarkingAsRead={isMarkingAsRead}
                    />
                  ),
                },
                {
                  value: 'celebrations',
                  label: `Ganhos (${viewModel.celebrations.length})`,
                  content: (
                    <NotificationsInboxSection
                      title="Reconhecimento e recompensa"
                      description="Conquistas, nivel, metas batidas e sinais de progresso que sustentam retorno diario."
                      items={viewModel.celebrations}
                      emptyTitle="Ainda sem celebracoes recentes"
                      emptyDescription="Assim que voce fechar metas, streaks ou ganhos de nivel, o feed aparece aqui."
                      onOpen={(route) => history.push(route)}
                      onMarkAsRead={(notificationId) => void handleMarkAsRead(notificationId)}
                      isMarkingAsRead={isMarkingAsRead}
                    />
                  ),
                },
                {
                  value: 'all',
                  label: `Tudo (${viewModel.inbox.length})`,
                  content: (
                    <NotificationsInboxSection
                      title="Linha completa de sinais"
                      description="Visao unica de treino, nutricao, agua, streak, conquistas e atualizacoes da jornada."
                      items={viewModel.inbox}
                      emptyTitle="Inbox vazia"
                      emptyDescription="Sem sinais novos no momento."
                      onOpen={(route) => history.push(route)}
                      onMarkAsRead={(notificationId) => void handleMarkAsRead(notificationId)}
                      isMarkingAsRead={isMarkingAsRead}
                    />
                  ),
                },
              ]}
            />
          )}
        </div>

        <aside className="space-y-5">
          <NotificationsPushReadinessCard
            pushState={pushState}
            onEnablePush={() => void handleEnablePush()}
            isEnablingPush={isEnablingPush}
          />

          <div className="fq-shell-panel px-5 py-5">
            <FqText as="p" className="fq-subtle-label">
              Integracao com o ecossistema
            </FqText>
            <FqText as="p" className="mt-2 text-sm font-semibold text-foreground">
              Esses alertas nao vivem isolados
            </FqText>
            <FqText as="p" className="mt-2 text-sm text-muted-foreground">
              Home, Perfil, Progresso e Gamificacao consomem a mesma camada de sinais para manter coerencia entre execucao diaria, lembretes e recompensa.
            </FqText>
            <div className="mt-4 grid gap-2">
              <FqButton variant="outline" tone="neutral" onClick={() => history.push('/tabs/student')}>
                Voltar para Home do aluno
              </FqButton>
              <FqButton variant="ghost" tone="neutral" onClick={() => history.push('/tabs/profile')}>
                Ajustar preferencias no perfil
              </FqButton>
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}
