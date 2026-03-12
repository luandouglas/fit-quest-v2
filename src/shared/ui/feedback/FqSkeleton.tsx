import type { HTMLAttributes } from 'react'

import type { FqBaseProps } from '@/shared/ui/types'
import { cx } from '@/shared/utils'

type FqSkeletonProps = FqBaseProps &
  Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'className'> & {
    rounded?: 'sm' | 'md' | 'lg' | 'full'
  }

const roundedMap: Record<NonNullable<FqSkeletonProps['rounded']>, string> = {
  sm: 'rounded',
  md: 'rounded-md',
  lg: 'rounded-xl',
  full: 'rounded-full',
}

export function FqSkeleton({
  rounded = 'md',
  className,
  
  testId,
  ...rest
}: FqSkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cx('fq-skeleton-sheen bg-zinc-200/90', roundedMap[rounded], className)}
     
      data-testid={testId}
      {...rest}
    />
  )
}
