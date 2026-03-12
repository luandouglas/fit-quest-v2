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
            <FqText as="h2" className="mt-2 text-base font-semibold text-foreground">
              Poucos toques, zero atrito
            </FqText>
            <FqText as="p" className="text-sm text-muted-foreground">
              Registre o que importa agora sem sair do fluxo da sua rotina.
            </FqText>
          </div>
          <FqTag tone="secondary">Acesso rapido</FqTag>
        </div>

        {recommendedAction ? (
          <div className="rounded-[calc(var(--radius)+6px)] border border-primary/16 bg-[linear-gradient(180deg,rgba(95,141,118,0.1)_0%,rgba(95,141,118,0.04)_100%)] p-4 shadow-[0_12px_28px_rgba(95,141,118,0.08)]">
            <FqText as="p" className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
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
                  'min-h-[156px] items-start justify-start rounded-[calc(var(--radius)+6px)] border px-4 py-4 text-left shadow-none transition-[transform,box-shadow,border-color,background-color] duration-200',
                  isRecommended
                    ? 'border-primary/24 bg-[linear-gradient(180deg,rgba(95,141,118,0.1)_0%,rgba(95,141,118,0.04)_100%)] shadow-[0_14px_30px_rgba(95,141,118,0.08)]'
                    : 'border-border/75 bg-background/72',
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
                  <span className="mb-3 inline-flex rounded-full border border-border/70 bg-card/84 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground shadow-[0_8px_18px_rgba(36,49,44,0.04)]">
                    {isRecommended ? 'Recomendado' : getStatusLabel(action.status)}
                  </span>
                  <span className="block text-base font-semibold text-foreground">{action.label}</span>
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
