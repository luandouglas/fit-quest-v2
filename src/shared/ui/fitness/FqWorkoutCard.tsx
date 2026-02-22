import type { HTMLAttributes } from 'react'

import { FqBadge } from '@/shared/ui/primitives/FqBadge'
import { FqButton } from '@/shared/ui/primitives/FqButton'
import { cx } from '@/shared/utils'
import type { FqBaseProps } from '@/shared/ui/types'

type FqWorkoutCardProps = FqBaseProps &
  Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'className'> & {
    title: string
    duration: string
    level?: 'beginner' | 'intermediate' | 'advanced'
    calories?: number
    onStart?: () => void
  }

const levelToneMap: Record<NonNullable<FqWorkoutCardProps['level']>, 'success' | 'warning' | 'danger'> = {
  beginner: 'success',
  intermediate: 'warning',
  advanced: 'danger',
}

export function FqWorkoutCard({
  title,
  duration,
  level = 'beginner',
  calories,
  onStart,
  className,
  
  testId,
  ...rest
}: FqWorkoutCardProps) {
  return (
    <article
      className={cx('rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm', className)}
     
      data-testid={testId}
      {...rest}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-zinc-900">{title}</h3>
        <FqBadge tone={levelToneMap[level]}>{level}</FqBadge>
      </div>
      <div className="space-y-1 text-sm text-zinc-600">
        <p>Duração: {duration}</p>
        {calories !== undefined ? <p>Calorias estimadas: {calories}</p> : null}
      </div>
      <div className="mt-4">
        <FqButton leftIcon="play" onClick={onStart}>
          Iniciar treino
        </FqButton>
      </div>
    </article>
  )
}
