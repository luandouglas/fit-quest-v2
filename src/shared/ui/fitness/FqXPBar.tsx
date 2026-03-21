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
    <div
      className={cx(
        'fq-gradient-surface w-full rounded-lg border border-border/70 p-4 shadow-float',
        className,
      )}
      data-testid={testId}
      {...rest}
    >
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

      <div className="overflow-hidden rounded-full border border-border/50 bg-muted/90 shadow-inset-soft">
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={safeTarget}
          aria-valuenow={safeCurrent}
          className="relative h-2.5 rounded-full fq-progress-xp transition-width duration-300 ease-out"
          style={{ width: `${percent}%` }}
        >
          <span
            aria-hidden="true"
            className="absolute inset-y-0 right-0 w-12 fq-progress-shimmer"
          />
        </div>
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        {remainingXP > 0 ? `Faltam ${remainingXP} XP para a meta` : 'Meta semanal concluida'}
      </p>
    </div>
  )
}
