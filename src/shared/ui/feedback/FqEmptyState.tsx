import type { HTMLAttributes, ReactNode } from 'react'

import { FqButton } from '@/shared/ui/primitives/FqButton'
import { FqIcon, type IconName } from '@/shared/ui/primitives/FqIcon'
import type { FqBaseProps } from '@/shared/ui/types'
import { cx } from '@/shared/utils'

type FqEmptyStateProps = FqBaseProps &
  Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'className'> & {
    title: string
    description?: string
    icon?: IconName
    actionLabel?: string
    onAction?: () => void
    secondaryAction?: ReactNode
  }

export function FqEmptyState({
  title,
  description,
  icon = 'info',
  actionLabel,
  onAction,
  secondaryAction,
  className,
  
  testId,
  ...rest
}: FqEmptyStateProps) {
  return (
    <div
      className={cx(
        'fq-fitness-glow fq-soft-reveal flex w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/35 p-6 text-center',
        className,
      )}
     
      data-testid={testId}
      {...rest}
    >
      <div className="relative">
        <span className="inline-flex rounded-full bg-card p-3 text-primary shadow-sm ring-1 ring-border">
          <FqIcon name={icon} size={20} />
        </span>
        <span className="absolute -bottom-1 -right-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-success text-success-foreground shadow-sm">
          <FqIcon name="check" size={12} />
        </span>
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description ? <p className="max-w-md text-sm text-muted-foreground">{description}</p> : null}
      {actionLabel ? (
        <FqButton size="sm" onClick={onAction}>
          {actionLabel}
        </FqButton>
      ) : null}
      {secondaryAction}
    </div>
  )
}
