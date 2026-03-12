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
        'fq-fitness-glow fq-soft-reveal flex w-full flex-col items-center justify-center gap-3 rounded-[calc(var(--radius)+6px)] border border-dashed border-border/75 bg-muted/38 p-7 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]',
        className,
      )}
     
      data-testid={testId}
      {...rest}
    >
      <div className="relative">
        <span className="inline-flex rounded-full border border-border/70 bg-card/92 p-3.5 text-primary shadow-[0_12px_26px_rgba(36,49,44,0.08)] ring-1 ring-white/40">
          <FqIcon name={icon} size={20} />
        </span>
        <span className="absolute -bottom-1 -right-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-success text-success-foreground shadow-[0_8px_18px_rgba(77,135,107,0.24)]">
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
