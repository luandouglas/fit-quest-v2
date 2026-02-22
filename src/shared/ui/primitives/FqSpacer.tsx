import type { HTMLAttributes } from 'react'

import type { FqBaseProps } from '@/shared/ui/types'

type FqSpacerProps = FqBaseProps &
  Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'className'> & {
    size?: 4 | 8 | 12 | 16 | 20 | 24 | 32 | 40 | 48
    axis?: 'x' | 'y' | 'both'
  }

const sizeClassMap: Record<NonNullable<FqSpacerProps['size']>, string> = {
  4: 'h-1 w-1',
  8: 'h-2 w-2',
  12: 'h-3 w-3',
  16: 'h-4 w-4',
  20: 'h-5 w-5',
  24: 'h-6 w-6',
  32: 'h-8 w-8',
  40: 'h-10 w-10',
  48: 'h-12 w-12',
}

const xSizeClassMap: Record<NonNullable<FqSpacerProps['size']>, string> = {
  4: 'w-1 h-px',
  8: 'w-2 h-px',
  12: 'w-3 h-px',
  16: 'w-4 h-px',
  20: 'w-5 h-px',
  24: 'w-6 h-px',
  32: 'w-8 h-px',
  40: 'w-10 h-px',
  48: 'w-12 h-px',
}

const ySizeClassMap: Record<NonNullable<FqSpacerProps['size']>, string> = {
  4: 'h-1 w-px',
  8: 'h-2 w-px',
  12: 'h-3 w-px',
  16: 'h-4 w-px',
  20: 'h-5 w-px',
  24: 'h-6 w-px',
  32: 'h-8 w-px',
  40: 'h-10 w-px',
  48: 'h-12 w-px',
}

export function FqSpacer({
  size = 12,
  axis = 'y',
  className,
  testId,
  ...rest
}: FqSpacerProps) {
  const axisClass =
    axis === 'x'
      ? xSizeClassMap[size]
      : axis === 'y'
        ? ySizeClassMap[size]
        : sizeClassMap[size]

  return <div aria-hidden="true" data-testid={testId} className={`${axisClass} ${className ?? ''}`.trim()} {...rest} />
}
