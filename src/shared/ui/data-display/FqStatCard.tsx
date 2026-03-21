import type { HTMLAttributes } from 'react'

import { FqIcon, type IconName } from '@/shared/ui/primitives/FqIcon'
import { cx } from '@/shared/utils'
import type { FqBaseProps } from '@/shared/ui/types'

type FqStatCardProps = FqBaseProps &
  Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'className'> & {
    label: string
    value: string | number
    delta?: string
    helperText?: string
    icon?: IconName
  }

export function FqStatCard({
  label,
  value,
  delta,
  helperText,
  icon,
  className,
  
  testId,
  ...rest
}: FqStatCardProps) {
  return (
    <div
      className={cx(
        'fq-raise-hover relative isolate min-h-30 overflow-hidden rounded-lg border border-border/80 bg-card/90 p-4 shadow-elevated',
        className,
      )}
     
      data-testid={testId}
      {...rest}
    >
      <div
        aria-hidden="true"
        className="fq-gradient-overlay-top pointer-events-none absolute inset-x-0 top-0 h-16"
      />
      <div className="relative flex items-start justify-between gap-3">
        <span className="text-description font-medium text-muted-foreground">{label}</span>
        {icon ? (
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/70 bg-background/85 text-muted-foreground shadow-card">
            <FqIcon name={icon} size={15} />
          </span>
        ) : null}
      </div>
      <p className="relative mt-3 text-section-title font-semibold leading-none tracking-tight text-card-foreground">
        {value}
      </p>
      {delta ? <p className="relative mt-2 text-xs font-semibold text-success">{delta}</p> : null}
      {helperText ? <p className="relative mt-1.5 text-xs leading-relaxed text-muted-foreground">{helperText}</p> : null}
    </div>
  )
}
