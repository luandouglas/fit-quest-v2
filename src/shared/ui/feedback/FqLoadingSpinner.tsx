import type { HTMLAttributes } from 'react'

import type { FqBaseProps, FqTone } from '@/shared/ui/types'
import { cx } from '@/shared/utils'

const toneMap: Record<FqTone, string> = {
  primary: 'border-blue-600',
  secondary: 'border-slate-600',
  success: 'border-emerald-600',
  warning: 'border-amber-500',
  danger: 'border-rose-600',
  neutral: 'border-zinc-800',
}

type FqLoadingSpinnerProps = FqBaseProps &
  Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'className'> & {
    tone?: FqTone
    size?: 'xs' | 'sm' | 'md' | 'lg'
    label?: string
  }

const sizeMap: Record<NonNullable<FqLoadingSpinnerProps['size']>, string> = {
  xs: 'h-4 w-4 border-2',
  sm: 'h-5 w-5 border-2',
  md: 'h-7 w-7 border-2',
  lg: 'h-9 w-9 border-4',
}

export function FqLoadingSpinner({
  tone = 'primary',
  size = 'md',
  label = 'Carregando',
  className,
  
  testId,
  ...rest
}: FqLoadingSpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cx('inline-flex items-center gap-2', className)}
     
      data-testid={testId}
      {...rest}
    >
      <span
        className={cx(
          'inline-block animate-spin rounded-full border-r-transparent',
          toneMap[tone],
          sizeMap[size],
        )}
      />
      <span className="sr-only">{label}</span>
    </div>
  )
}
