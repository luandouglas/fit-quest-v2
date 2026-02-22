import type { HTMLAttributes } from 'react'

import type { FqBaseProps } from '@/shared/ui/types'
import { cx } from '@/shared/utils'

type FqStackProps = FqBaseProps &
  Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'className'> & {
    direction?: 'row' | 'col'
    gap?: 4 | 8 | 12 | 16 | 20 | 24 | 32
    align?: 'start' | 'center' | 'end' | 'stretch'
    justify?: 'start' | 'center' | 'end' | 'between' | 'around'
    wrap?: boolean
  }

const alignMap: Record<NonNullable<FqStackProps['align']>, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
}

const justifyMap: Record<NonNullable<FqStackProps['justify']>, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
}

const gapMap: Record<NonNullable<FqStackProps['gap']>, string> = {
  4: 'gap-1',
  8: 'gap-2',
  12: 'gap-3',
  16: 'gap-4',
  20: 'gap-5',
  24: 'gap-6',
  32: 'gap-8',
}

export function FqStack({
  direction = 'col',
  gap = 12,
  align = 'stretch',
  justify = 'start',
  wrap = false,
  className,
  testId,
  children,
  ...rest
}: FqStackProps) {
  return (
    <div
      className={cx(
        'flex',
        direction === 'row' ? 'flex-row' : 'flex-col',
        gapMap[gap],
        alignMap[align],
        justifyMap[justify],
        wrap ? 'flex-wrap' : null,
        className,
      )}
      data-testid={testId}
      {...rest}
    >
      {children}
    </div>
  )
}
