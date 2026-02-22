import type { HTMLAttributes } from 'react'

import type { FqBaseProps } from '@/shared/ui/types'
import { cx } from '@/shared/utils'

type FqContainerProps = FqBaseProps &
  Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'className'> & {
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  }

const sizeMap: Record<NonNullable<FqContainerProps['size']>, string> = {
  sm: 'max-w-xl',
  md: 'max-w-3xl',
  lg: 'max-w-5xl',
  xl: 'max-w-7xl',
  full: 'max-w-none',
}

export function FqContainer({
  size = 'xl',
  className,
  
  testId,
  children,
  ...rest
}: FqContainerProps) {
  return (
    <div
      className={cx('mx-auto w-full px-4 sm:px-6', sizeMap[size], className)}
     
      data-testid={testId}
      {...rest}
    >
      {children}
    </div>
  )
}
