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
        'w-full rounded-[calc(var(--radius)+6px)] border border-border/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.36)_0%,rgba(255,255,255,0)_100%),linear-gradient(180deg,rgba(252,250,246,0.9)_0%,rgba(245,241,232,0.72)_100%)] p-4 shadow-[0_12px_28px_rgba(36,49,44,0.05)]',
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

      <div className="overflow-hidden rounded-full border border-border/55 bg-muted/85 shadow-[inset_0_1px_2px_rgba(36,49,44,0.06)]">
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={safeTarget}
          aria-valuenow={safeCurrent}
          className="relative h-2.5 rounded-full bg-[linear-gradient(90deg,var(--primary)_0%,color-mix(in_srgb,var(--secondary)_30%,var(--primary))_100%)] transition-[width] duration-300 ease-out"
          style={{ width: `${percent}%` }}
        >
          <span
            aria-hidden="true"
            className="absolute inset-y-0 right-0 w-12 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.28)_100%)]"
          />
        </div>
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        {remainingXP > 0 ? `Faltam ${remainingXP} XP para a meta` : 'Meta semanal concluida'}
      </p>
    </div>
  )
}
