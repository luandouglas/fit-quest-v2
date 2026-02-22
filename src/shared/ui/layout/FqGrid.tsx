import type { HTMLAttributes } from 'react'

import type { FqBaseProps } from '@/shared/ui/types'
import { cx } from '@/shared/utils'

type FqGridProps = FqBaseProps &
  Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'className'> & {
    columns?: 1 | 2 | 3 | 4 | 5 | 6
    gap?: 4 | 8 | 12 | 16 | 20 | 24 | 32
  }

const columnMap: Record<NonNullable<FqGridProps['columns']>, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5',
  6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-6',
}

const gapMap: Record<NonNullable<FqGridProps['gap']>, string> = {
  4: 'gap-1',
  8: 'gap-2',
  12: 'gap-3',
  16: 'gap-4',
  20: 'gap-5',
  24: 'gap-6',
  32: 'gap-8',
}

export function FqGrid({
  columns = 3,
  gap = 16,
  className,
  testId,
  children,
  ...rest
}: FqGridProps) {
  return (
    <div className={cx('grid', columnMap[columns], gapMap[gap], className)} data-testid={testId} {...rest}>
      {children}
    </div>
  )
}
