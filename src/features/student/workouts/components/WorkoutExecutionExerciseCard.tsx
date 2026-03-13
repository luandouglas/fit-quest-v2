import { FqButton, FqTag, FqText } from '@/shared/ui'
import { cx } from '@/shared/utils'

import type { ExerciseItem } from '../types'

type WorkoutExecutionExerciseCardProps = {
  exercise: ExerciseItem
  doneSets: number
  isActive: boolean
  isPaused: boolean
  isLocked: boolean
  onFocus: () => void
}

export function WorkoutExecutionExerciseCard({
  exercise,
  doneSets,
  isActive,
  isPaused,
  isLocked,
  onFocus,
}: WorkoutExecutionExerciseCardProps) {
  const isCompleted = doneSets >= exercise.sets
  const statusTone = isCompleted ? 'success' : isActive ? 'primary' : 'neutral'
  const statusLabel = isCompleted ? 'Concluído' : isActive ? 'Agora' : 'Na fila'
  const remainingSets = Math.max(exercise.sets - doneSets, 0)

  return (
    <div
      className={cx(
        'rounded-[20px] border p-4 transition-colors',
        isCompleted
          ? 'border-success/18 bg-success/6'
          : isActive
            ? 'border-primary/24 bg-primary/10'
            : 'border-border/75 bg-background/70',
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <FqText as="p" className="text-base font-semibold text-foreground">
              {exercise.order}. {exercise.name}
            </FqText>
            <FqTag tone={statusTone}>{statusLabel}</FqTag>
          </div>

          <FqText as="p" className="text-sm text-muted-foreground">
            {`${doneSets}/${exercise.sets} series • ${exercise.reps} reps • ${exercise.restSec}s de pausa`}
          </FqText>

          {isActive && exercise.note ? (
            <FqText as="p" className="text-sm text-foreground">
              {exercise.note}
            </FqText>
          ) : null}
        </div>

        <div className="flex items-center gap-2 sm:justify-end">
          {!isCompleted ? (
            <FqTag tone={isActive ? 'primary' : 'neutral'}>
              {remainingSets === 0
                ? 'Fechado'
                : `${remainingSets} restante${remainingSets === 1 ? '' : 's'}`}
            </FqTag>
          ) : null}
          {!isCompleted && !isActive ? (
            <FqButton
              size="sm"
              variant="outline"
              tone="neutral"
              onClick={onFocus}
              isDisabled={isLocked || isPaused}
            >
              Trazer para agora
            </FqButton>
          ) : null}
        </div>
      </div>
    </div>
  )
}
