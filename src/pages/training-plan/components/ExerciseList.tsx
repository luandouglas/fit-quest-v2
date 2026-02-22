import { FqText } from '@/shared/ui'

import type { ExerciseItem } from '../TrainingPlanPage'
import { ExerciseRow } from './ExerciseRow'

type ExerciseListProps = {
  exercises: ExerciseItem[]
  onSetCurrent: (id: string) => void
  onToggleDone: (id: string) => void
}

export function ExerciseList({ exercises, onSetCurrent, onToggleDone }: ExerciseListProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Exercícios</h3>
        <FqText as="p" className="text-sm text-muted-foreground">
          {exercises.length} no total
        </FqText>
      </div>

      <div className="space-y-3">
        {exercises.map((exercise) => (
          <ExerciseRow
            key={exercise.id}
            exercise={exercise}
            onSetCurrent={onSetCurrent}
            onToggleDone={onToggleDone}
          />
        ))}
      </div>
    </section>
  )
}
