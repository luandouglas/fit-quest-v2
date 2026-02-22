import type { HTMLAttributes } from 'react'

import { clamp, cx } from '@/shared/utils'
import type { FqBaseProps } from '@/shared/ui/types'

type FqXPBarProps = FqBaseProps &
  Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'className'> & {
    currentXP: number
    targetXP: number
    label?: string
  }

export function FqXPBar({
  currentXP,
  targetXP,
  label = 'XP',
  className,
  testId,
  ...rest
}: FqXPBarProps) {
  const safeTarget = Math.max(targetXP, 1)
  const percent = clamp((currentXP / safeTarget) * 100, 0, 100)

  return (
    <div className={cx('w-full space-y-1.5', className)} data-testid={testId} {...rest}>
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>{label}</span>
        <span>
          {currentXP}/{safeTarget}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-200">
        <progress
          max={100}
          value={percent}
          className="h-2.5 w-full overflow-hidden rounded-full [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-zinc-200 [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-gradient-to-r [&::-webkit-progress-value]:from-primary [&::-webkit-progress-value]:to-cyan-500 [&::-moz-progress-bar]:bg-primary"
        />
      </div>
    </div>
  )
}
