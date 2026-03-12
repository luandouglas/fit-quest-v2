import type { HTMLAttributes } from 'react'

import type { FqBaseProps, FqTone } from '@/shared/ui/types'
import { clamp, cx } from '@/shared/utils'

const toneMap: Record<FqTone, string> = {
  primary: 'bg-[linear-gradient(90deg,var(--primary)_0%,color-mix(in_srgb,var(--primary)_72%,var(--card))_100%)]',
  secondary: 'bg-[linear-gradient(90deg,var(--secondary)_0%,color-mix(in_srgb,var(--secondary)_78%,var(--card))_100%)]',
  success: 'bg-[linear-gradient(90deg,var(--success)_0%,color-mix(in_srgb,var(--success)_78%,var(--card))_100%)]',
  warning: 'bg-[linear-gradient(90deg,var(--warning)_0%,color-mix(in_srgb,var(--warning)_76%,var(--card))_100%)]',
  danger: 'bg-[linear-gradient(90deg,var(--destructive)_0%,color-mix(in_srgb,var(--destructive)_78%,var(--card))_100%)]',
  neutral: 'bg-[linear-gradient(90deg,var(--foreground)_0%,color-mix(in_srgb,var(--foreground)_72%,var(--card))_100%)]',
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
      <div className="overflow-hidden rounded-full border border-border/55 bg-muted/85 shadow-[inset_0_1px_2px_rgba(36,49,44,0.05)]">
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(safeValue)}
          className={cx(
            'relative h-2.5 rounded-full transition-[width] duration-300 ease-out',
            toneMap[tone],
          )}
          style={{ width: `${safeValue}%` }}
        >
          <span
            aria-hidden="true"
            className="absolute inset-y-0 right-0 w-10 bg-[linear-gradient(90deg,transparent_0%,color-mix(in_srgb,var(--card)_28%,transparent)_100%)]"
          />
        </div>
      </div>
      {showLabel ? <p className="text-xs text-muted-foreground">{safeValue}%</p> : null}
    </div>
  )
}
