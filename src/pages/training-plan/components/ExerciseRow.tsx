import { FqButton, FqIcon, FqTag } from '@/shared/ui'
import { cx } from '@/shared/utils'

import type { ExerciseItem } from '../TrainingPlanPage'

type ExerciseRowProps = {
  exercise: ExerciseItem
  onSetCurrent: (id: string) => void
  onToggleDone: (id: string) => void
}

const stateClassMap = {
  done: 'border-success/40 bg-card',
  current: 'border-secondary/50 bg-card',
  upcoming: 'border-border bg-card',
} as const

export function ExerciseRow({ exercise, onSetCurrent, onToggleDone }: ExerciseRowProps) {
  const isDone = exercise.status === 'done'
  const isCurrent = exercise.status === 'current'

  return (
    <article
      className={cx(
        'grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border p-4 shadow-sm md:grid-cols-[40px_minmax(0,1fr)_120px_150px]',
        stateClassMap[exercise.status],
      )}
    >
      <span className="hidden h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground md:inline-flex">
        <FqIcon name={exercise.iconName ?? 'dumbbell'} size={16} />
      </span>

      <div className="min-w-0">
        <p className={cx('truncate text-base font-semibold text-foreground', isDone ? 'line-through opacity-70' : null)}>{exercise.name}</p>
        <p className="text-sm text-muted-foreground">
          {exercise.sets} sets x {exercise.reps} reps
        </p>
      </div>

      <p className="hidden items-center gap-1 text-sm text-muted-foreground md:inline-flex">
        <FqIcon name="clock" size={12} />
        {exercise.durationMin} min
      </p>

      <div className="flex items-center justify-end gap-2">
        {isDone ? (
          <FqButton tone="success" variant="outline" leftIcon="check" onClick={() => onToggleDone(exercise.id)}>
            Concluído
          </FqButton>
        ) : isCurrent ? (
          <>
            <FqButton tone="primary" leftIcon="check" onClick={() => onToggleDone(exercise.id)}>
              Marcar feito
            </FqButton>
            <FqButton tone="secondary" variant="outline" leftIcon="play" onClick={() => onSetCurrent(exercise.id)}>
              Retomar
            </FqButton>
          </>
        ) : (
          <>
            <FqTag tone="neutral" className="rounded-lg px-2 py-1 text-xs">
              #{exercise.order}
            </FqTag>
            <FqButton tone="secondary" variant="outline" leftIcon="play" onClick={() => onSetCurrent(exercise.id)}>
              Próximo
            </FqButton>
          </>
        )}
      </div>
    </article>
  )
}
