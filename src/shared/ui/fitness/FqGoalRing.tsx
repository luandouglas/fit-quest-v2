import type { HTMLAttributes } from 'react'

import { FqProgressRing } from '@/shared/ui/fitness/FqProgressRing'
import { FqText } from '@/shared/ui/primitives/FqText'
import { cx } from '@/shared/utils'
import type { FqBaseProps, FqTone } from '@/shared/ui/types'

type FqGoalRingProps = FqBaseProps &
  Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'className'> & {
    value: number
    max?: number
    title: string
    subtitle?: string
    tone?: FqTone
    size?: number
  }

export function FqGoalRing({
  value,
  max = 100,
  title,
  subtitle,
  tone = 'primary',
  size = 120,
  className,
  testId,
  ...rest
}: FqGoalRingProps) {
  return (
    <div
      className={cx(
        'fq-raise-hover fq-gradient-surface rounded-[calc(var(--radius)+4px)] border border-border/75 p-4 shadow-[0_14px_30px_rgba(36,49,44,0.05)]',
        className,
      )}
      data-testid={testId}
      {...rest}
    >
      <div className="flex items-center gap-4">
        <FqProgressRing value={value} max={max} tone={tone} size={size} />
        <div className="space-y-1">
          <FqText as="p" className="text-sm font-semibold text-foreground">
            {title}
          </FqText>
          {subtitle ? (
            <FqText as="p" className="text-xs text-muted-foreground">
              {subtitle}
            </FqText>
          ) : null}
        </div>
      </div>
    </div>
  )
}
