import { FqCard, FqDivider, FqEmptyState } from '@/shared/ui'

import type { Meal } from '../NutritionPage'
import { MealCard } from './MealCard'

type MealsListProps = {
  meals: Meal[]
  isOffline?: boolean
  isDateLocked?: boolean
  onRegisterMeal: (mealId: string) => void
  onToggleMealSkipped: (mealId: string) => void
  onOpenMeal: (mealId: string) => void
}

export function MealsList({
  meals,
  isOffline = false,
  isDateLocked = false,
  onRegisterMeal,
  onToggleMealSkipped,
  onOpenMeal,
}: MealsListProps) {
  return (
    <FqCard className="border-border bg-card">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-foreground">Refeicoes</h2>
          <p className="text-sm text-muted-foreground">
            {isDateLocked ? 'Somente leitura' : `${meals.length} no total`}
          </p>
        </div>

        <FqDivider className="bg-border" />

        {meals.length ? (
          <div className="space-y-3">
            {meals.map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                isOffline={isOffline}
                isDateLocked={isDateLocked}
                onRegister={onRegisterMeal}
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
