import { FqCard, FqEmptyState, FqIcon, FqProgressBar, FqTag } from '@/shared/ui'

import type { NutritionDay } from '../NutritionPage'
import { MacrosProgress } from './MacrosProgress'

type DailySummaryCardProps = {
  day: NutritionDay
  mealCompletionPct: number
  isDayComplete: boolean
}

export function DailySummaryCard({ day, mealCompletionPct, isDayComplete }: DailySummaryCardProps) {
  const hasGoals = day.goals.calories > 0

  if (!hasGoals) {
    return (
      <FqCard className="border-border bg-card">
        <FqEmptyState
          icon="target"
          title="Metas nao configuradas ainda"
          description="Seu nutricionista ainda nao definiu as metas de macros para este dia."
        />
      </FqCard>
    )
  }

  const caloriesProgress = Math.round((day.consumed.calories / Math.max(day.goals.calories, 1)) * 100)

  return (
    <FqCard className="border-border bg-card">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-muted-foreground">Resumo do dia</p>
          {isDayComplete ? (
            <FqTag tone="success" className="rounded-lg px-2 py-1 text-[11px] normal-case tracking-normal">
              Dia completo
            </FqTag>
          ) : (
            <FqTag tone="secondary" className="rounded-lg px-2 py-1 text-[11px] normal-case tracking-normal">
              {mealCompletionPct}% das refeicoes
            </FqTag>
          )}
        </div>

        <div className="rounded-xl bg-accent p-3">
          <div className="mb-2 flex items-end justify-between gap-2">
            <p className="text-sm font-medium text-foreground">Calorias</p>
            <p className="text-sm font-semibold text-foreground">
              {day.consumed.calories}
              <span className="ml-1 text-xs font-medium text-muted-foreground">/ {day.goals.calories} kcal</span>
            </p>
          </div>
          <FqProgressBar value={caloriesProgress} tone="secondary" showLabel={false} />
        </div>

        <div className="space-y-3">
          <MacrosProgress label="Proteina" consumed={day.consumed.protein} target={day.goals.protein} tone="primary" />
          <MacrosProgress label="Carboidrato" consumed={day.consumed.carbs} target={day.goals.carbs} tone="secondary" />
          <MacrosProgress label="Gordura" consumed={day.consumed.fat} target={day.goals.fat} tone="warning" />
        </div>

        {isDayComplete && day.starsEarned ? (
          <div className="inline-flex items-center gap-2 rounded-xl border border-gamification/30 bg-gamification/10 px-3 py-2 text-sm font-medium text-foreground">
            <FqIcon name="star" className="text-gamification" size={14} />
            +{day.starsEarned} estrelas por concluir o dia
          </div>
        ) : null}
      </div>
    </FqCard>
  )
}
