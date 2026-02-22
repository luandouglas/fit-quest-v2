import { FqEmptyState } from '@/shared/ui'

import type { Meal } from '../types'
import { MealCard } from './MealCard'

type MealsListProps = {
  meals: Meal[]
  isOffline: boolean
  onRegisterMeal: (mealId: string) => void
  onUndoSkipMeal: (mealId: string) => void
  onOpenMealDetails: (mealId: string) => void
}

export function MealsList({
  meals,
  isOffline,
  onRegisterMeal,
  onUndoSkipMeal,
  onOpenMealDetails,
}: MealsListProps) {
  if (!meals.length) {
    return (
      <FqEmptyState
        icon="utensils"
        title="Nenhuma refeicao para este dia"
        description="Assim que seu nutricionista publicar o plano, ele aparece aqui."
      />
    )
  }

  return (
    <div className="space-y-3">
      {meals.map((meal) => (
        <MealCard
          key={meal.id}
          meal={meal}
          isOffline={isOffline}
          onRegister={onRegisterMeal}
          onUndoSkip={onUndoSkipMeal}
          onOpenDetails={onOpenMealDetails}
        />
      ))}
    </div>
  )
}
