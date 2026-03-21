import { FqButton, FqCard, FqTag, FqText } from '@/shared/ui'

import type { StudentHomeViewModel } from '../hooks/useStudentHomeViewModel'

type StudentQuickActionsCardProps = {
  quickActions: StudentHomeViewModel['quickActions']
  onAction: (path: string) => void
  onQuickMeal: () => Promise<void>
  onQuickWater: () => Promise<void>
  isRegisterMealPending: boolean
  isRegisterWaterPending: boolean
}

export function StudentQuickActionsCard({
  quickActions,
  onAction,
  onQuickMeal,
  onQuickWater,
  isRegisterMealPending,
  isRegisterWaterPending,
}: StudentQuickActionsCardProps) {
  const orderedActions = [...quickActions].sort((left, right) => {
    const weight = {
      available: 0,
      completed: 1,
      locked: 2,
    } as const

    return weight[left.status] - weight[right.status]
  })
  const recommendedAction = orderedActions.find((action) => action.status === 'available') ?? orderedActions[0] ?? null

  function getStatusLabel(status: StudentHomeViewModel['quickActions'][number]['status']) {
    if (status === 'completed') {
      return 'Feito'
    }

    if (status === 'locked') {
      return 'Depois'
    }

    return 'Agora'
  }

  return (
    <FqCard className="border-border/80 bg-card/95">
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <FqText as="p" className="fq-subtle-label">
              Ações essenciais
            </FqText>
            <FqText as="h2" className="mt-2 text-sm font-semibold text-foreground">
              Poucos toques, zero atrito
            </FqText>
            <FqText as="p" className="text-sm text-muted-foreground">
              Registre o que importa agora sem sair do fluxo da sua rotina.
            </FqText>
          </div>
          <FqTag tone="secondary">Acesso rapido</FqTag>
        </div>

        {recommendedAction ? (
          <div className="fq-gradient-soft-primary rounded-xl border border-primary/15 p-4 shadow-float">
            <FqText as="p" className="text-xs font-semibold uppercase tracking-caps-wide text-primary">
              Ação recomendada
            </FqText>
            <FqText as="p" className="mt-2 text-sm font-semibold text-foreground">
              {recommendedAction.label}
            </FqText>
            <FqText as="p" className="mt-1 text-xs text-muted-foreground">
              {recommendedAction.description}
            </FqText>
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {orderedActions.map((action, index) => {
            const isMealAction = action.key === 'log_meal'
            const isWaterAction = action.key === 'log_water'
            const isRecommended = action.id === recommendedAction?.id && action.status === 'available'

            return (
              <FqButton
                key={action.id}
                tone={action.status === 'available' ? action.tone : 'neutral'}
                variant={action.status === 'available' ? 'outline' : 'ghost'}
                className={[
                  'min-h-39 items-start justify-start rounded-xl border px-4 py-4 text-left shadow-none transition-interactive duration-200',
                  isRecommended
                    ? 'fq-gradient-soft-primary border-primary/25 shadow-float'
                    : 'border-border/70 bg-background/70',
                ].join(' ')}
                leftIcon={action.icon}
                isDisabled={action.status === 'locked'}
                isLoading={(isMealAction && isRegisterMealPending) || (isWaterAction && isRegisterWaterPending)}
                onClick={() => {
                  if (isMealAction) {
                    void onQuickMeal()
                    return
                  }

                  if (isWaterAction) {
                    void onQuickWater()
                    return
                  }

                  onAction(action.targetRoute)
                }}
              >
                <>
                  <span className="mb-3 inline-flex rounded-full border border-border/70 bg-card/85 px-2.5 py-1 text-2xs font-semibold uppercase tracking-caps-wide text-muted-foreground shadow-card">
                    {isRecommended ? 'Recomendado' : getStatusLabel(action.status)}
                  </span>
                  <span className="block text-sm font-semibold text-foreground">{action.label}</span>
                  <span className="mt-2 block text-sm font-normal leading-relaxed text-muted-foreground">
                    {action.description}
                  </span>
                  <span className="mt-auto block pt-3 text-xs font-semibold text-foreground/80">
                    {action.status === 'completed'
                      ? 'Já contabilizado no seu dia'
                      : action.status === 'locked'
                        ? 'Fica disponível quando o fluxo liberar'
                        : index === 0
                          ? 'Toque e resolva isso agora'
                          : 'Atalho pronto para poucos toques'}
                  </span>
                </>
              </FqButton>
            )
          })}
        </div>
      </div>
    </FqCard>
  )
}
