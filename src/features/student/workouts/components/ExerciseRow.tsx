import { FqButton, FqIcon, FqTag } from '@/shared/ui'
import { cx } from '@/shared/utils'

import type { ExerciseItem } from '../types'

type ExerciseRowProps = {
  exercise: ExerciseItem
  onSetCurrent: (id: string) => void
  onToggleDone: (id: string) => void
}

const stateClassMap = {
  done: 'border-success/35 bg-success/5',
  current: 'border-secondary/45 bg-secondary/5',
  upcoming: 'border-border bg-background',
} as const

export function ExerciseRow({ exercise, onSetCurrent, onToggleDone }: ExerciseRowProps) {
  const isDone = exercise.status === 'done'
  const isCurrent = exercise.status === 'current'

  return (
    <article
      className={cx(
        'flex flex-col gap-3 rounded-xl border px-3 py-3 transition md:grid md:grid-cols-[44px_minmax(0,1fr)_120px_auto] md:items-center md:gap-4 md:px-4',
        !isDone ? 'hover:border-border hover:bg-accent/35' : null,
        stateClassMap[exercise.status],
      )}
      role={isDone ? undefined : 'button'}
      tabIndex={isDone ? -1 : 0}
      onClick={isDone ? undefined : () => onSetCurrent(exercise.id)}
      onKeyDown={
        isDone
          ? undefined
          : (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onSetCurrent(exercise.id)
              }
            }
      }
    >
      <span className="hidden h-11 w-11 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground md:inline-flex">
        <FqIcon name={exercise.iconName ?? 'dumbbell'} size={15} />
      </span>

      <div className="min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2 md:block">
          <p className={cx('truncate text-base font-semibold text-foreground', isDone ? 'line-through opacity-70' : null)}>
            {exercise.name}
          </p>
          <p className="inline-flex items-center gap-1 text-xs text-muted-foreground md:hidden">
            <FqIcon name="clock" size={12} />
            {exercise.durationMin} min
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <FqTag tone="neutral" className="rounded-md px-2 py-0.5 text-xs">
            {exercise.sets} sets x {exercise.reps} reps
          </FqTag>
          {isCurrent ? (
            <FqTag tone="secondary" className="rounded-md px-2 py-0.5 text-xs">
              Em execução
            </FqTag>
          ) : null}
        </div>
      </div>

      <p className="hidden items-center justify-end gap-1 text-sm text-muted-foreground md:inline-flex">
        <FqIcon name="clock" size={12} />
        {exercise.durationMin} min
      </p>

      <div className="flex flex-wrap items-center gap-2 md:justify-end">
        {isDone ? (
          <FqButton
            tone="success"
            variant="outline"
            leftIcon="check"
            size="md"
            className="w-full sm:w-auto"
            onClick={(event) => {
              event.stopPropagation()
              onToggleDone(exercise.id)
            }}
          >
            Concluído
          </FqButton>
        ) : isCurrent ? (
          <>
            <FqButton
              tone="primary"
              leftIcon="check"
              size="md"
              className="w-full sm:w-auto"
              onClick={(event) => {
                event.stopPropagation()
                onToggleDone(exercise.id)
              }}
            >
              Marcar feito
            </FqButton>
            <FqButton
              tone="secondary"
              variant="outline"
              leftIcon="play"
              size="md"
              className="w-full sm:w-auto"
              onClick={(event) => {
                event.stopPropagation()
                onSetCurrent(exercise.id)
              }}
            >
              Retomar
            </FqButton>
          </>
        ) : (
          <>
            <FqTag tone="neutral" className="rounded-lg px-2 py-1 text-xs">
              #{exercise.order}
            </FqTag>
            <FqButton
              tone="secondary"
              variant="outline"
              leftIcon="play"
              size="md"
              className="w-full sm:w-auto"
              onClick={(event) => {
                event.stopPropagation()
                onSetCurrent(exercise.id)
              }}
            >
              Próximo
            </FqButton>
          </>
        )}
      </div>
    </article>
  )
}
