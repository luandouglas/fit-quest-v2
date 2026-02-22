import { FqButton, FqCard, FqIcon, FqTag } from '@/shared/ui'
import { cx } from '@/shared/utils'

import type { Meal } from '../NutritionPage'

type MealCardProps = {
  meal: Meal
  isOffline?: boolean
  isDateLocked?: boolean
  onRegister: (mealId: string) => void
  onToggleSkipped: (mealId: string) => void
  onOpenDetails: (mealId: string) => void
}

const statusToneMap = {
  pending: 'warning',
  done: 'success',
  skipped: 'danger',
} as const

const statusLabelMap = {
  pending: 'Pendente',
  done: 'Concluida',
  skipped: 'Pulada',
} as const

const statusCardClassMap = {
  pending: 'border-border bg-card',
  done: 'border-success/30 bg-success/5',
  skipped: 'border-warning/40 bg-warning/10',
} as const

export function MealCard({
  meal,
  isOffline = false,
  isDateLocked = false,
  onRegister,
  onToggleSkipped,
  onOpenDetails,
}: MealCardProps) {
  const mealMacro = meal.targetMacros
  const isActionDisabled = isOffline || isDateLocked

  return (
    <FqCard className={cx('border transition-colors', statusCardClassMap[meal.status])}>
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-0.5">
            <p className="text-base font-semibold text-foreground">{meal.name}</p>
            <p className="inline-flex items-center gap-1 text-sm text-muted-foreground">
              <FqIcon name="clock" size={13} />
              {meal.time}
            </p>
          </div>

          <FqTag tone={statusToneMap[meal.status]} className="rounded-lg px-2.5 py-1 text-[11px] normal-case tracking-normal">
            {statusLabelMap[meal.status]}
          </FqTag>
        </div>

        <div className="rounded-xl bg-accent px-3 py-2">
          <p className="text-xs text-muted-foreground">
            Meta da refeicao: {mealMacro.calories} kcal | P {mealMacro.protein}g | C {mealMacro.carbs}g | G {mealMacro.fat}g
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {meal.status === 'pending' ? (
            <>
              <FqButton
                tone="primary"
                leftIcon="check"
                onClick={() => onRegister(meal.id)}
                isDisabled={isActionDisabled}
                className="flex-1"
              >
                Registrar
              </FqButton>
              <FqButton
                tone="warning"
                variant="outline"
                onClick={() => onToggleSkipped(meal.id)}
                isDisabled={isActionDisabled}
              >
                Pular
              </FqButton>
            </>
          ) : null}

          {meal.status === 'done' ? (
            <FqButton tone="success" variant="outline" leftIcon="check" className="flex-1" isDisabled>
              Concluida
            </FqButton>
          ) : null}

          {meal.status === 'skipped' ? (
            <FqButton
              tone="warning"
              variant="outline"
              onClick={() => onToggleSkipped(meal.id)}
              isDisabled={isActionDisabled}
              className="flex-1"
            >
              Desfazer pulo
            </FqButton>
          ) : null}

          <FqButton
            tone="secondary"
            variant="outline"
            onClick={() => onOpenDetails(meal.id)}
            className={cx(meal.status === 'pending' ? '' : 'flex-1')}
          >
            Ver detalhes
          </FqButton>
        </div>
      </div>
    </FqCard>
  )
}
