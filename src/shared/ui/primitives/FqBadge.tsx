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
        'inline-flex items-center rounded-full px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.16em] shadow-[0_8px_18px_rgba(36,49,44,0.04)]',
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
