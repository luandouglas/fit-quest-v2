import type { HTMLAttributes } from 'react'

import type { FqBaseProps } from '@/shared/ui/types'
import { cx } from '@/shared/utils'

type FqPageProps = FqBaseProps & Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'className'>

export function FqPage({ className, testId, children, ...rest }: FqPageProps) {
  return (
    <div
      className={cx('min-h-screen bg-zinc-50 text-zinc-900', className)}
     
      data-testid={testId}
      {...rest}
    >
      {children}
    </div>
  )
}
