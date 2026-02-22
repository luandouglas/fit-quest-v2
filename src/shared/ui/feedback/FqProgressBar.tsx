import type { HTMLAttributes } from 'react'

import type { FqBaseProps, FqTone } from '@/shared/ui/types'
import { clamp, cx } from '@/shared/utils'

const toneMap: Record<FqTone, string> = {
  primary:
    '[&::-webkit-progress-value]:bg-primary [&::-moz-progress-bar]:bg-primary',
  secondary:
    '[&::-webkit-progress-value]:bg-secondary [&::-moz-progress-bar]:bg-secondary',
  success:
    '[&::-webkit-progress-value]:bg-success [&::-moz-progress-bar]:bg-success',
  warning:
    '[&::-webkit-progress-value]:bg-warning [&::-moz-progress-bar]:bg-warning',
  danger:
    '[&::-webkit-progress-value]:bg-destructive [&::-moz-progress-bar]:bg-destructive',
  neutral:
    '[&::-webkit-progress-value]:bg-foreground [&::-moz-progress-bar]:bg-foreground',
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
      <progress
        max={100}
        value={safeValue}
        className={cx(
          'h-2.5 w-full overflow-hidden rounded-full [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-muted',
          '[&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:transition-all',
          toneMap[tone],
        )}
      />
      {showLabel ? <p className="text-xs text-muted-foreground">{safeValue}%</p> : null}
    </div>
  )
}
