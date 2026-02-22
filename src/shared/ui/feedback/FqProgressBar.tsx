import type { HTMLAttributes } from 'react'

import type { FqBaseProps, FqTone } from '@/shared/ui/types'
import { clamp, cx } from '@/shared/utils'

const toneMap: Record<FqTone, string> = {
  primary:
    '[&::-webkit-progress-value]:bg-primary [&::-moz-progress-bar]:bg-primary',
  secondary:
    '[&::-webkit-progress-value]:bg-slate-600 [&::-moz-progress-bar]:bg-slate-600',
  success:
    '[&::-webkit-progress-value]:bg-emerald-600 [&::-moz-progress-bar]:bg-emerald-600',
  warning:
    '[&::-webkit-progress-value]:bg-amber-500 [&::-moz-progress-bar]:bg-amber-500',
  danger:
    '[&::-webkit-progress-value]:bg-rose-600 [&::-moz-progress-bar]:bg-rose-600',
  neutral:
    '[&::-webkit-progress-value]:bg-zinc-900 [&::-moz-progress-bar]:bg-zinc-900',
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
          'h-2.5 w-full overflow-hidden rounded-full [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-zinc-200',
          '[&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:transition-all',
          toneMap[tone],
        )}
      />
      {showLabel ? <p className="text-xs text-zinc-500">{safeValue}%</p> : null}
    </div>
  )
}
