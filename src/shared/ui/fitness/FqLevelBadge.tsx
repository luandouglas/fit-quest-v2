import type { HTMLAttributes } from 'react'

import { cx } from '@/shared/utils'
import type { FqBaseProps } from '@/shared/ui/types'

type FqLevelBadgeProps = FqBaseProps &
  Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'className'> & {
    level: number
    label?: string
  }

export function FqLevelBadge({
  level,
  label = 'Level',
  className,
  
  testId,
  ...rest
}: FqLevelBadgeProps) {
  return (
    <div
      className={cx(
        'fq-gradient-soft-secondary inline-flex items-center gap-2 rounded-full border border-secondary/20 px-3 py-1.5 text-sm font-semibold text-secondary shadow-elevated',
        className,
      )}
     
      data-testid={testId}
      {...rest}
    >
      <span className="rounded-full bg-secondary px-2 py-0.5 text-caption uppercase tracking-caps text-secondary-foreground">
        {label}
      </span>
      <span className="text-sm">{level}</span>
    </div>
  )
}
