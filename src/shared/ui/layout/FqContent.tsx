import type { HTMLAttributes } from 'react'

import type { FqBaseProps } from '@/shared/ui/types'
import { cx } from '@/shared/utils'

type FqContentProps = FqBaseProps & Omit<HTMLAttributes<HTMLElement>, 'style' | 'className'>

export function FqContent({ className, testId, children, ...rest }: FqContentProps) {
  return (
    <main
      className={cx('mx-auto w-full max-w-7xl px-4 py-5 sm:px-5', className)}
     
      data-testid={testId}
      {...rest}
    >
      {children}
    </main>
  )
}
