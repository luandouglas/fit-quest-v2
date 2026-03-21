import { FqCard, FqDivider, FqEmptyState } from '@/shared/ui'
import type { Meal } from '@/shared/services/contracts/nutrition'

import { MealCard } from './MealCard'

type MealsListProps = {
  meals: Meal[]
  isDisabled?: boolean
  completedCount: number
  pendingCount: number
  onRegisterMeal: (mealId: string) => void
  onToggleMealSkipped: (mealId: string) => void
  onOpenMeal: (mealId: string) => void
}

export function MealsList({
  meals,
  isDisabled = false,
  completedCount,
  pendingCount,
  onRegisterMeal,
  onToggleMealSkipped,
  onOpenMeal,
}: MealsListProps) {
  return (
    <FqCard className="border-border bg-card">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-card-title font-semibold text-foreground">Plano alimentar do dia</h2>
            <p className="text-sm text-muted-foreground">Marque, acompanhe e mantenha a adesao em poucos toques.</p>
          </div>
          <p className="text-sm text-muted-foreground">{completedCount} concluidas • {pendingCount} faltando</p>
        </div>

        <FqDivider className="bg-border" />

        {meals.length ? (
          <div className="space-y-3">
            {meals.map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                isDisabled={isDisabled}
                onMarkDone={onRegisterMeal}
                onToggleSkipped={onToggleMealSkipped}
                onOpenDetails={onOpenMeal}
              />
            ))}
          </div>
        ) : (
          <FqEmptyState
            icon="utensils"
            title="Sem plano alimentar atribuido"
            description="Solicite ao seu nutricionista um plano para comecar seus registros diarios."
          />
        )}
      </div>
    </FqCard>
  )
}
