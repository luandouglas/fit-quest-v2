import { FqAlert, FqButton, FqCard, FqTag, FqText } from '@/shared/ui'
import type { NotificationPushState } from '@/shared/services/contracts/notifications'

type NotificationsPushReadinessCardProps = {
  pushState: NotificationPushState
  onEnablePush: () => void
  isEnablingPush?: boolean
}

function getPermissionTone(permission: NotificationPushState['permission']) {
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

function getPermissionLabel(permission: NotificationPushState['permission']) {
  if (permission === 'granted') {
    return 'Permissao ativa'
  }

  if (permission === 'denied') {
    return 'Permissao negada'
  }

  if (permission === 'prompt') {
    return 'Pronto para ativar'
  }

  return 'Nao suportado'
}

export function NotificationsPushReadinessCard({
  pushState,
  onEnablePush,
  isEnablingPush = false,
}: NotificationsPushReadinessCardProps) {
  const permissionTone = getPermissionTone(pushState.permission)
  const canEnable = pushState.permission === 'prompt'

  return (
    <FqCard
      title="Push e lembretes prontos para dispositivo"
      subtitle="A camada ja esta preparada para Capacitor, notificacoes locais e push remoto sem acoplar a interface ao provider."
      className="border-border bg-card"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <FqTag tone={permissionTone}>{getPermissionLabel(pushState.permission)}</FqTag>
          <FqTag tone="neutral">{pushState.platform.toUpperCase()}</FqTag>
          <FqTag tone={pushState.isRegistered ? 'success' : 'neutral'}>
            {pushState.isRegistered ? 'Dispositivo registrado' : 'Registro pendente'}
          </FqTag>
        </div>

        <FqAlert tone={permissionTone} title="Origem dos avisos">
          Treino, nutricao, agua, streak, conquistas e mudancas vindas do personal ou da dieta convergem para a mesma camada de sinais contextuais.
        </FqAlert>

        <div className="rounded-xl border border-border/70 bg-muted/10 p-4">
          <FqText as="p" className="text-sm font-semibold text-foreground">
            Estado atual
          </FqText>
          <FqText as="p" className="mt-1 text-sm text-muted-foreground">
            {pushState.permission === 'granted'
              ? 'Seu dispositivo esta apto a receber avisos futuros quando o adapter nativo for conectado.'
              : pushState.permission === 'denied'
                ? 'O sistema bloqueou avisos. O restante da inbox continua funcionando dentro do app.'
                : pushState.permission === 'prompt'
                  ? 'Voce pode ativar avisos agora e deixar a experiencia pronta para push real.'
                  : 'O ambiente atual nao expoe a API de notificacoes, mas a modelagem continua pronta para Firebase e Capacitor.'}
          </FqText>
        </div>

        <div className="flex flex-wrap gap-2">
          <FqButton onClick={onEnablePush} isLoading={isEnablingPush} isDisabled={!canEnable}>
            Ativar avisos neste dispositivo
          </FqButton>
          <FqButton variant="outline" tone="neutral" isDisabled>
            Adapter nativo em evolucao
          </FqButton>
        </div>
      </div>
    </FqCard>
  )
}
