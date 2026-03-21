import { FqButton, FqCard, FqIcon, FqTag } from '@/shared/ui'
import type { Meal } from '@/shared/services/contracts/nutrition'
import { cx } from '@/shared/utils'

type MealCardProps = {
  meal: Meal
  isDisabled?: boolean
  onMarkDone: (mealId: string) => void
  onToggleSkipped: (mealId: string) => void
  onOpenDetails: (mealId: string) => void
}

const statusToneMap = {
  pending: 'warning',
  done: 'success',
  skipped: 'secondary',
} as const

const statusLabelMap = {
  pending: 'Pendente',
  done: 'Concluida',
  skipped: 'Pulada',
} as const

const statusCardClassMap = {
  pending: 'border-border bg-card',
  done: 'border-success/30 bg-success/5',
  skipped: 'border-secondary/35 bg-secondary/10',
} as const

export function MealCard({
  meal,
  isDisabled = false,
  onMarkDone,
  onToggleSkipped,
  onOpenDetails,
}: MealCardProps) {
  const mealMacro = meal.targetMacros
  const itemsPreview = meal.items.map((item) => item.label).join(' • ')

  return (
    <FqCard className={cx('border transition-colors', statusCardClassMap[meal.status])}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-foreground">{meal.name}</p>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <FqIcon name="clock" size={13} />
                {meal.time}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{itemsPreview}</p>
          </div>

          <FqTag tone={statusToneMap[meal.status]} className="rounded-lg px-2.5 py-1 text-2xs normal-case tracking-normal">
            {statusLabelMap[meal.status]}
          </FqTag>
        </div>

        <div className="grid gap-2 rounded-2xl bg-accent/80 p-3 sm:grid-cols-4">
          <div className="space-y-1">
            <p className="text-2xs uppercase tracking-caps text-muted-foreground">Kcal</p>
            <p className="text-sm font-semibold text-foreground">{mealMacro.calories}</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xs uppercase tracking-caps text-muted-foreground">Proteina</p>
            <p className="text-sm font-semibold text-foreground">{mealMacro.protein}g</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xs uppercase tracking-caps text-muted-foreground">Carbo</p>
            <p className="text-sm font-semibold text-foreground">{mealMacro.carbs}g</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xs uppercase tracking-caps text-muted-foreground">Gordura</p>
            <p className="text-sm font-semibold text-foreground">{mealMacro.fat}g</p>
          </div>
        </div>

        {meal.note ? (
          <div className="rounded-2xl border border-border/80 bg-background/70 px-3 py-2.5">
            <p className="text-2xs uppercase tracking-caps text-muted-foreground">Observacao</p>
            <p className="mt-1 text-sm text-foreground">{meal.note}</p>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          {meal.status !== 'done' ? (
            <FqButton
              tone="primary"
              leftIcon="check"
              onClick={() => onMarkDone(meal.id)}
              isDisabled={isDisabled}
              className="flex-1"
            >
              Concluir
            </FqButton>
          ) : (
            <FqButton tone="success" variant="outline" leftIcon="check" isDisabled className="flex-1">
              Registrada
            </FqButton>
          )}

          <FqButton
            tone={meal.status === 'skipped' ? 'secondary' : 'warning'}
            variant="outline"
            onClick={() => onToggleSkipped(meal.id)}
            isDisabled={isDisabled}
          >
            {meal.status === 'skipped' ? 'Desfazer' : 'Pular'}
          </FqButton>

          <FqButton tone="secondary" variant="outline" onClick={() => onOpenDetails(meal.id)}>
            Ver refeicao
          </FqButton>
        </div>
      </div>
    </FqCard>
  )
}
