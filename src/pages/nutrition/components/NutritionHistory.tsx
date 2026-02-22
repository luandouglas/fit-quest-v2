import { FqBadge, FqButton, FqCard, FqEmptyState, FqIcon } from '@/shared/ui'

import type { NutritionDay } from '../types'

type NutritionHistoryProps = {
  days: NutritionDay[]
  selectedDate: string
  onSelectDate: (date: string) => void
}

function formatDate(dateIso: string) {
  const date = new Date(`${dateIso}T00:00:00`)
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    weekday: 'short',
  }).format(date)
}

export function NutritionHistory({ days, selectedDate, onSelectDate }: NutritionHistoryProps) {
  if (!days.length) {
    return (
      <FqEmptyState
        icon="calendar"
        title="Sem historico disponivel"
        description="Assim que houver registros diarios, eles aparecem aqui."
      />
    )
  }

  return (
    <div className="space-y-3">
      {days.map((day) => {
        const completedMeals = day.meals.filter((meal) => meal.status === 'done').length
        const mealsPct = Math.round((completedMeals / Math.max(day.meals.length, 1)) * 100)
        const isCompleted = mealsPct === 100 && day.consumed.waterMl >= day.goals.waterMl

        return (
          <FqCard key={day.date} className="border-border bg-card">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">{formatDate(day.date)}</p>
                <p className="text-sm text-muted-foreground">
                  Refeicoes: {mealsPct}% · {day.consumed.calories} kcal · Agua: {day.consumed.waterMl} ml
                </p>
              </div>

              <div className="flex items-center gap-2">
                <FqBadge tone={isCompleted ? 'success' : 'warning'}>{isCompleted ? 'OK' : 'Pendente'}</FqBadge>
                <FqButton
                  variant={selectedDate === day.date ? 'solid' : 'outline'}
                  tone="secondary"
                  size="md"
                  onClick={() => onSelectDate(day.date)}
                  className="min-h-11"
                >
                  Abrir dia
                </FqButton>
              </div>
            </div>

            {isCompleted && day.starsEarned ? (
              <p className="mt-3 inline-flex items-center gap-1 text-sm text-tertiary">
                <FqIcon name="star" className="text-tertiary" ariaLabel="Estrelas" />+{day.starsEarned} estrelas
              </p>
            ) : null}
          </FqCard>
        )
      })}
    </div>
  )
}
