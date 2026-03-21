import { FqCard, FqEmptyState, FqGoalRing, FqIcon, FqProgressBar, FqTag, FqXPBar } from '@/shared/ui'
import type { NutritionDay } from '@/shared/services/contracts/nutrition'

import { MacrosProgress } from './MacrosProgress'

type DailySummaryCardProps = {
  day: NutritionDay
  mealCompletionPct: number
  isDayComplete: boolean
  pendingMealsCount: number
}

export function DailySummaryCard({ day, mealCompletionPct, isDayComplete, pendingMealsCount }: DailySummaryCardProps) {
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
      <div className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Resumo do dia</p>
            <h2 className="text-sm font-semibold text-foreground">Sua adesao alimentar de hoje</h2>
            <p className="text-sm text-muted-foreground">
              {isDayComplete
                ? 'Dia alimentar fechado com macros e hidratacao no alvo.'
                : `${pendingMealsCount} refeicoes ainda pedem registro para fechar o dia.`}
            </p>
          </div>

          <FqTag tone={isDayComplete ? 'success' : 'secondary'} className="rounded-lg px-2 py-1 text-2xs normal-case tracking-normal">
            {isDayComplete ? 'Dia completo' : `${mealCompletionPct}% concluido`}
          </FqTag>
        </div>

        <div className="grid gap-4 lg:fq-grid-label-content">
          <FqGoalRing
            value={mealCompletionPct}
            max={100}
            title={`${day.meals.filter((meal) => meal.status === 'done').length}/${day.meals.length} refeicoes`}
            subtitle="aderencia do plano"
            tone={isDayComplete ? 'success' : 'secondary'}
            size={110}
          />

          <div className="space-y-4">
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

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border/80 bg-background/80 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <FqIcon name="star" className="text-gamification" size={14} />
                  <p className="text-xs uppercase tracking-caps text-muted-foreground">Estrelas do dia</p>
                </div>
                <p className="mt-2 text-sm font-semibold text-foreground">+{day.starsEarned ?? 0}</p>
              </div>
              <div className="rounded-xl border border-border/80 bg-background/80 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <FqIcon name="flask" className="text-secondary" size={14} />
                  <p className="text-xs uppercase tracking-caps text-muted-foreground">Agua</p>
                </div>
                <p className="mt-2 text-sm font-semibold text-foreground">{day.consumed.waterMl} ml</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <MacrosProgress label="Proteina" consumed={day.consumed.protein} target={day.goals.protein} tone="primary" />
          <MacrosProgress label="Carboidrato" consumed={day.consumed.carbs} target={day.goals.carbs} tone="secondary" />
          <MacrosProgress label="Gordura" consumed={day.consumed.fat} target={day.goals.fat} tone="warning" />
        </div>

        <FqXPBar
          currentXP={day.consumed.protein + day.consumed.waterMl / 100}
          targetXP={day.goals.protein + day.goals.waterMl / 100}
          label="Progresso combinado de proteina e hidratacao"
          showPercent
        />
      </div>
    </FqCard>
  )
}
