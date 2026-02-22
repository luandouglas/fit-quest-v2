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
        'inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-800',
        className,
      )}
     
      data-testid={testId}
      {...rest}
    >
      <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">{label}</span>
      <span>{level}</span>
    </div>
  )
}
