import type { HTMLAttributes } from 'react'

import { cx } from '@/shared/utils'
import type { FqBaseProps } from '@/shared/ui/types'

type FqHeaderProps = FqBaseProps & Omit<HTMLAttributes<HTMLElement>, 'style' | 'className'>

export function FqHeader({ className, testId, children, ...rest }: FqHeaderProps) {
  return (
    <header
      className={cx('sticky top-0 z-20 border-b border-zinc-200 bg-white/90 backdrop-blur', className)}
     
      data-testid={testId}
      {...rest}
    >
      {children}
    </header>
  )
}
