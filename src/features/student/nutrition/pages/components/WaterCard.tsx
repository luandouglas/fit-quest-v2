import { FqButton, FqCard, FqIcon, FqProgressBar, FqTag } from '@/shared/ui'

type WaterCardProps = {
  consumedMl: number
  goalMl: number
  onQuickAdd: (ml: number) => void
  onUndoLast?: () => void
  isDisabled?: boolean
}

const quickActions = [200, 300, 500]

export function WaterCard({
  consumedMl,
  goalMl,
  onQuickAdd,
  onUndoLast,
  isDisabled = false,
}: WaterCardProps) {
  const safeGoal = Math.max(goalMl, 1)
  const progress = Math.min(Math.round((consumedMl / safeGoal) * 100), 100)
  const remaining = Math.max(goalMl - consumedMl, 0)

  return (
    <FqCard className="border-border bg-card">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Agua</p>
            <p className="text-sm font-semibold text-foreground">
              {consumedMl}
              <span className="ml-1 text-xs font-medium text-muted-foreground">/ {goalMl} ml</span>
            </p>
          </div>
          <FqTag tone={remaining > 0 ? 'secondary' : 'success'}>{remaining > 0 ? `${remaining} ml restantes` : 'Meta batida'}</FqTag>
        </div>

        <FqProgressBar value={progress} tone="secondary" showLabel={false} />

        <div className="grid grid-cols-3 gap-2">
          {quickActions.map((amount) => (
            <FqButton
              key={amount}
              size="md"
              variant="outline"
              tone="secondary"
              onClick={() => onQuickAdd(amount)}
              isDisabled={isDisabled}
              className="w-full"
            >
              +{amount} ml
            </FqButton>
          ))}
        </div>

        <div className="flex items-center justify-between gap-2 rounded-xl bg-accent px-3 py-2">
          <p className="text-xs text-muted-foreground">
            {remaining > 0 ? `Faltam ${remaining} ml para bater a meta.` : 'Meta de hidratacao concluida hoje.'}
          </p>
          {onUndoLast ? (
            <FqButton variant="ghost" tone="secondary" onClick={onUndoLast} isDisabled={isDisabled || consumedMl <= 0}>
              Desfazer
            </FqButton>
          ) : (
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
              <FqIcon name="flask" size={16} />
            </span>
          )}
        </div>
      </div>
    </FqCard>
  )
}
