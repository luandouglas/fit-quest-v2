import type { HTMLAttributes } from 'react'

import { cx } from '@/shared/utils'
import type { FqBaseProps } from '@/shared/ui/types'

type FqListProps = FqBaseProps & Omit<HTMLAttributes<HTMLUListElement>, 'style' | 'className'>

export function FqList({ className, testId, children, ...rest }: FqListProps) {
  return (
    <ul
      className={cx('divide-y divide-zinc-100 overflow-hidden rounded-lg border border-zinc-200 bg-white', className)}
     
      data-testid={testId}
      {...rest}
    >
      {children}
    </ul>
  )
}
