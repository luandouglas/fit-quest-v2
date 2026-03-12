import { FqButton, FqCard, FqProgressBar, FqTag, FqText } from '@/shared/ui'
import type { StudentDashboard } from '@/shared/services/contracts/student'

import type { StudentHomeViewModel } from '../hooks/useStudentHomeViewModel'

type StudentNutritionHomeCardProps = {
  dashboard: StudentDashboard
  viewModel: StudentHomeViewModel
  onOpenNutrition: () => void
  onQuickMeal: () => Promise<void>
  onQuickWater: () => Promise<void>
  isRegisterMealPending: boolean
  isRegisterWaterPending: boolean
}

export function StudentNutritionHomeCard({
  dashboard,
  viewModel,
  onOpenNutrition,
  onQuickMeal,
  onQuickWater,
  isRegisterMealPending,
  isRegisterWaterPending,
}: StudentNutritionHomeCardProps) {
  return (
    <FqCard className="border-border bg-card">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <FqText as="h2" className="text-base font-semibold text-foreground">
              Nutrição e água
            </FqText>
            <FqText as="p" className="text-sm text-muted-foreground">
              O que falta registrar para fechar a nutrição do dia.
            </FqText>
          </div>
          <FqTag tone={dashboard.nutritionPlan.status === 'completed' ? 'success' : 'warning'}>
            {viewModel.completedMealsCount}/{dashboard.nutritionPlan.meals.length} refeições
          </FqTag>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-background p-4">
            <FqText as="p" className="text-sm font-semibold text-foreground">
              Plano alimentar
            </FqText>
            <div className="mt-3">
              <FqProgressBar value={dashboard.nutritionPlan.adherencePct} tone={dashboard.nutritionPlan.status === 'completed' ? 'success' : 'primary'} />
            </div>
            <div className="mt-3 space-y-2">
              {dashboard.nutritionPlan.meals.map((meal) => (
                <div key={meal.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border px-3 py-2">
                  <div>
                    <FqText as="p" className="text-sm font-semibold text-foreground">
                      {meal.name}
                    </FqText>
                    <FqText as="p" className="text-xs text-muted-foreground">
                      {meal.scheduledAt}
                    </FqText>
                  </div>
                  <FqTag tone={meal.status === 'completed' ? 'success' : meal.status === 'skipped' ? 'danger' : 'warning'}>
                    {meal.status === 'completed' ? 'Registrada' : meal.status === 'skipped' ? 'Pulada' : 'Pendente'}
                  </FqTag>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-background p-4">
            <FqText as="p" className="text-sm font-semibold text-foreground">
              Hidratação
            </FqText>
            <div className="mt-3">
              <FqProgressBar value={dashboard.waterProgress.completionPct} tone={dashboard.waterProgress.status === 'completed' ? 'success' : 'secondary'} />
            </div>
            <FqText as="p" className="mt-2 text-xs text-muted-foreground">
              {dashboard.waterProgress.consumedMl}/{dashboard.waterProgress.targetMl} ml • faltam {dashboard.waterProgress.remainingMl} ml
            </FqText>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <FqButton
                leftIcon="check"
                variant="outline"
                tone="neutral"
                onClick={() => {
                  void onQuickMeal()
                }}
                isLoading={isRegisterMealPending}
              >
                Registrar refeição
              </FqButton>
              <FqButton
                leftIcon="plus"
                variant="outline"
                tone="neutral"
                onClick={() => {
                  void onQuickWater()
                }}
                isLoading={isRegisterWaterPending}
              >
                Adicionar água
              </FqButton>
            </div>
          </div>
        </div>

        <FqButton variant="ghost" tone="neutral" onClick={onOpenNutrition}>
          Abrir nutrição completa
        </FqButton>
      </div>
    </FqCard>
  )
}
