import type { HTMLAttributes } from 'react'

import { cx } from '@/shared/utils'
import type { FqBaseProps } from '@/shared/ui/types'

type FqListItemProps = FqBaseProps & Omit<HTMLAttributes<HTMLLIElement>, 'style' | 'className'>

export function FqListItem({ className, testId, children, ...rest }: FqListItemProps) {
  return (
    <li className={cx('px-4 py-3 text-sm text-zinc-700', className)} data-testid={testId} {...rest}>
      {children}
    </li>
  )
}
