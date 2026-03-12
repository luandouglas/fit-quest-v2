import { FqButton, FqIcon, FqProgressBar, FqTag, FqText } from '@/shared/ui'
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
  const progressPct = exercise.sets > 0 ? Math.round((doneSets / exercise.sets) * 100) : 0
  const remainingSets = Math.max(exercise.sets - doneSets, 0)
  const statusTone = isCompleted ? 'success' : isActive ? 'primary' : 'neutral'
  const statusLabel = isCompleted ? 'Concluído' : isActive ? 'Agora' : 'Na fila'

  return (
    <div
      className={cx(
        'rounded-[26px] border p-4 shadow-[0_12px_28px_rgba(36,49,44,0.05)] transition-colors md:p-5',
        isCompleted
          ? 'border-success/18 bg-success/6'
          : isActive
            ? 'border-primary/24 bg-primary/10'
            : 'border-border/75 bg-background/70',
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div
            className={cx(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border',
              isCompleted
                ? 'border-success/20 bg-success/10 text-success'
                : isActive
                  ? 'border-primary/20 bg-primary/12 text-primary'
                  : 'border-border/80 bg-card/90 text-muted-foreground',
            )}
          >
            <FqIcon name={exercise.iconName ?? 'dumbbell'} size={18} />
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <FqText as="p" className="text-base font-semibold text-foreground">
                {exercise.order}. {exercise.name}
              </FqText>
              <FqTag tone={statusTone}>{statusLabel}</FqTag>
            </div>

            <FqText as="p" className="text-sm text-muted-foreground">
              {exercise.sets} séries x {exercise.reps} repetições • pausa de {exercise.restSec}s
            </FqText>

            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {exercise.muscleGroup ? (
                <span className="rounded-full border border-border/70 bg-card/85 px-2.5 py-1">{exercise.muscleGroup}</span>
              ) : null}
              {exercise.suggestedLoadKg ? (
                <span className="rounded-full border border-border/70 bg-card/85 px-2.5 py-1">
                  {exercise.suggestedLoadKg} kg
                </span>
              ) : null}
              {exercise.equipment ? (
                <span className="rounded-full border border-border/70 bg-card/85 px-2.5 py-1">{exercise.equipment}</span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:min-w-[168px] lg:items-end">
          <div className="text-left lg:text-right">
            <FqText as="p" className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Progresso
            </FqText>
            <FqText as="p" className="mt-1 text-base font-semibold text-foreground">
              {doneSets}/{exercise.sets} séries
            </FqText>
          </div>

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

      <div className="mt-4 space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {isCompleted
              ? 'Exercício fechado'
              : `${remainingSets} série${remainingSets === 1 ? '' : 's'} restante${remainingSets === 1 ? '' : 's'}`}
          </span>
          <span>{progressPct}%</span>
        </div>
        <FqProgressBar value={progressPct} tone={isCompleted ? 'success' : isActive ? 'primary' : 'secondary'} showLabel={false} />
      </div>
    </div>
  )
}
