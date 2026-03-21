import type { HTMLAttributes } from 'react'

import type { FqBaseProps, FqTone } from '@/shared/ui/types'
import { clamp, cx } from '@/shared/utils'

const toneMap: Record<FqTone, string> = {
  primary: 'fq-progress-primary',
  secondary: 'fq-progress-secondary',
  success: 'fq-progress-success',
  warning: 'fq-progress-warning',
  danger: 'fq-progress-danger',
  neutral: 'fq-progress-neutral',
}

type FqProgressBarProps = FqBaseProps &
  Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'className'> & {
    value: number
    tone?: FqTone
    showLabel?: boolean
  }

export function FqProgressBar({
  value,
  tone = 'primary',
  showLabel = true,
  className,
  testId,
  ...rest
}: FqProgressBarProps) {
  const safeValue = clamp(value, 0, 100)

  return (
    <div className={cx('w-full space-y-1.5', className)} data-testid={testId} {...rest}>
      <div className="overflow-hidden rounded-full border border-border/50 bg-muted/90 shadow-inset-soft">
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(safeValue)}
          className={cx(
            'relative h-2.5 rounded-full transition-width duration-300 ease-out',
            toneMap[tone],
          )}
          style={{ width: `${safeValue}%` }}
        >
          <span
            aria-hidden="true"
            className="absolute inset-y-0 right-0 w-10 fq-progress-shimmer"
          />
        </div>
      </div>
      {showLabel ? <p className="text-xs text-muted-foreground">{safeValue}%</p> : null}
    </div>
  )
}
