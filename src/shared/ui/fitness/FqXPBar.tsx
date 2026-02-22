import type { HTMLAttributes } from 'react'

import { FqIcon } from '@/shared/ui/primitives/FqIcon'
import type { FqBaseProps } from '@/shared/ui/types'
import { clamp, cx } from '@/shared/utils'

type FqXPBarProps = FqBaseProps &
  Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'className'> & {
    currentXP: number
    targetXP: number
    label?: string
    showPercent?: boolean
  }

export function FqXPBar({
  currentXP,
  targetXP,
  label = 'XP',
  showPercent = true,
  className,
  testId,
  ...rest
}: FqXPBarProps) {
  const safeTarget = Math.max(targetXP, 1)
  const safeCurrent = clamp(currentXP, 0, safeTarget)
  const percent = clamp((safeCurrent / safeTarget) * 100, 0, 100)
  const remainingXP = Math.max(safeTarget - safeCurrent, 0)

  return (
    <div className={cx('w-full rounded-xl border border-border bg-card p-3 shadow-sm', className)} data-testid={testId} {...rest}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-star/15 text-star">
            <FqIcon name="star" size={12} />
          </span>
          <span className="truncate text-sm font-semibold text-foreground">{label}</span>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-semibold text-foreground">
            {safeCurrent}/{safeTarget}
          </p>
          {showPercent ? <p className="text-xs text-muted-foreground">{Math.round(percent)}%</p> : null}
        </div>
      </div>

      <progress
        max={safeTarget}
        value={safeCurrent}
        className="h-1.5 w-full overflow-hidden rounded-full [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-muted [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-primary [&::-moz-progress-bar]:bg-primary"
      />

      <p className="mt-2 text-xs text-muted-foreground">
        {remainingXP > 0 ? `Faltam ${remainingXP} XP para a meta` : 'Meta semanal concluida'}
      </p>
    </div>
  )
}
