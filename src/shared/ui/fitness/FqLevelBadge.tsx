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
        'fq-gradient-soft-secondary inline-flex items-center gap-2 rounded-full border border-secondary/18 px-3 py-1.5 text-sm font-semibold text-secondary shadow-[0_10px_22px_rgba(120,146,174,0.14)]',
        className,
      )}
     
      data-testid={testId}
      {...rest}
    >
      <span className="rounded-full bg-secondary px-2 py-0.5 text-[0.68rem] uppercase tracking-[0.16em] text-secondary-foreground">
        {label}
      </span>
      <span className="text-base">{level}</span>
    </div>
  )
}
