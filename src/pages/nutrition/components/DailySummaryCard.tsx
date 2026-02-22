import { FqCard, FqEmptyState, FqProgressBar } from '@/shared/ui'

import type { NutritionDay } from '../types'
import { MacrosProgress } from './MacrosProgress'

type DailySummaryCardProps = {
  day: NutritionDay | null
}

export function DailySummaryCard({ day }: DailySummaryCardProps) {
  if (!day) {
    return (
      <FqCard className="border-border bg-card">
        <FqEmptyState
          title="Metas nao configuradas ainda"
          description="Seu nutricionista ainda nao publicou metas para este dia."
          icon="info"
        />
      </FqCard>
    )
  }

  const caloriesPct = day.goals.calories > 0 ? Math.round((day.consumed.calories / day.goals.calories) * 100) : 0

  return (
    <FqCard className="border-border bg-card">
      <div className="space-y-4">
        <div>
          <p className="text-base font-semibold text-foreground">Resumo</p>
          <p className="text-sm text-muted-foreground">Calorias e macros consumidos hoje</p>
        </div>

        <div className="space-y-1.5 rounded-xl bg-muted/50 p-3">
          <div className="flex items-end justify-between gap-3">
            <p className="text-sm text-muted-foreground">Calorias</p>
            <p className="text-lg font-semibold text-foreground">
              {day.consumed.calories}
              <span className="text-sm font-medium text-muted-foreground"> / {day.goals.calories} kcal</span>
            </p>
          </div>
          <FqProgressBar value={caloriesPct} tone="secondary" showLabel={false} />
        </div>

        <div className="space-y-3">
          <MacrosProgress label="Proteina" consumed={day.consumed.protein} goal={day.goals.protein} unit="g" />
          <MacrosProgress label="Carbo" consumed={day.consumed.carbs} goal={day.goals.carbs} unit="g" />
          <MacrosProgress label="Gordura" consumed={day.consumed.fat} goal={day.goals.fat} unit="g" />
        </div>
      </div>
    </FqCard>
  )
}
