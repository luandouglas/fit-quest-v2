import type { HTMLAttributes } from 'react'

import type { FqBaseProps } from '@/shared/ui/types'
import { cx } from '@/shared/utils'

type FqDividerProps = FqBaseProps &
  Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'className'> & {
    orientation?: 'horizontal' | 'vertical'
  }

export function FqDivider({
  orientation = 'horizontal',
  className,
  
  testId,
  ...rest
}: FqDividerProps) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cx(
        'm-0 shrink-0 bg-zinc-200',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px min-h-6 self-stretch',
        className,
      )}
     
      data-testid={testId}
      {...rest}
    />
  )
}
