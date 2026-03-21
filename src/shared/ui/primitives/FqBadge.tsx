import type { HTMLAttributes } from 'react'

import { fqBadgeToneMap } from '@/shared/ui/tokens'
import type { FqBaseProps, FqTone } from '@/shared/ui/types'
import { cx } from '@/shared/utils'

type FqBadgeProps = FqBaseProps &
  Omit<HTMLAttributes<HTMLSpanElement>, 'style' | 'className'> & {
    tone?: FqTone
  }

export function FqBadge({
  tone = 'neutral',
  className,
  
  testId,
  children,
  ...rest
}: FqBadgeProps) {
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-full px-3 py-1.5 text-caption font-semibold uppercase tracking-caps shadow-card',
        fqBadgeToneMap[tone],
        className,
      )}
     
      data-testid={testId}
      {...rest}
    >
      {children}
    </span>
  )
}
