import type { HTMLAttributes } from 'react'

import { cx } from '@/shared/utils'
import type { FqBaseProps } from '@/shared/ui/types'

type FqFooterProps = FqBaseProps & Omit<HTMLAttributes<HTMLElement>, 'style' | 'className'>

export function FqFooter({ className, testId, children, ...rest }: FqFooterProps) {
  return (
    <footer
      className={cx('border-t border-zinc-200 bg-white px-4 py-4 text-sm text-zinc-500', className)}
     
      data-testid={testId}
      {...rest}
    >
      {children}
    </footer>
  )
}
