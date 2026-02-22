import { FqBadge, FqButton, FqCard, FqIcon } from '@/shared/ui'

import type { Meal } from '../types'

type MealCardProps = {
  meal: Meal
  isOffline: boolean
  onRegister: (mealId: string) => void
  onUndoSkip: (mealId: string) => void
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

export function MealCard({ meal, isOffline, onRegister, onUndoSkip, onOpenDetails }: MealCardProps) {
  return (
    <FqCard className="border-border bg-card">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-base font-semibold text-foreground">{meal.name}</p>
            <p className="inline-flex items-center gap-1 text-sm text-muted-foreground">
              <FqIcon name="clock" size={14} ariaLabel="Horario" />
              {meal.time}
            </p>
          </div>
          <FqBadge tone={statusToneMap[meal.status]}>{statusLabelMap[meal.status]}</FqBadge>
        </div>

        <p className="text-sm text-muted-foreground">
          {meal.targetMacros.calories} kcal · P {meal.targetMacros.protein}g · C {meal.targetMacros.carbs}g · G {meal.targetMacros.fat}g
        </p>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          {meal.status === 'pending' ? (
            <FqButton
              size="md"
              tone="primary"
              leftIcon="check"
              onClick={() => onRegister(meal.id)}
              className="min-h-11 sm:w-auto"
              isDisabled={isOffline}
            >
              Registrar
            </FqButton>
          ) : null}

          {meal.status === 'done' ? (
            <FqButton
              size="md"
              tone="success"
              leftIcon="check"
              onClick={() => onOpenDetails(meal.id)}
              className="min-h-11 sm:w-auto"
            >
              Concluida
            </FqButton>
          ) : null}

          {meal.status === 'skipped' ? (
            <FqButton
              size="md"
              variant="outline"
              tone="warning"
              onClick={() => onUndoSkip(meal.id)}
              className="min-h-11 sm:w-auto"
              isDisabled={isOffline}
            >
              Desfazer
            </FqButton>
          ) : null}

          <FqButton
            size="md"
            variant="outline"
            tone="neutral"
            onClick={() => onOpenDetails(meal.id)}
            className="min-h-11 sm:w-auto"
          >
            Ver detalhes
          </FqButton>
        </div>
      </div>
    </FqCard>
  )
}
