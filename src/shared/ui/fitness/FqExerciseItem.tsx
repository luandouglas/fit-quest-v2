import type { HTMLAttributes } from 'react'

import { FqCheckbox } from '@/shared/ui/form/FqCheckbox'
import { cx } from '@/shared/utils'
import type { FqBaseProps } from '@/shared/ui/types'

type FqExerciseItemProps = FqBaseProps &
  Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'className'> & {
    name: string
    sets?: number
    reps?: number
    completed?: boolean
    onCompletedChange?: (completed: boolean) => void
  }

export function FqExerciseItem({
  name,
  sets = 3,
  reps = 12,
  completed = false,
  onCompletedChange,
  className,
  
  testId,
  ...rest
}: FqExerciseItemProps) {
  return (
    <div
      className={cx(
        'flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3',
        className,
      )}
     
      data-testid={testId}
      {...rest}
    >
      <div>
        <p className={cx('text-sm font-semibold', completed ? 'text-zinc-400 line-through' : 'text-zinc-900')}>
          {name}
        </p>
        <p className="text-xs text-zinc-500">
          {sets} x {reps}
        </p>
      </div>
      <FqCheckbox
        label="Feito"
        checked={completed}
        onChange={(event) => onCompletedChange?.(event.target.checked)}
      />
    </div>
  )
}
