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
        'flex w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center',
        className,
      )}
     
      data-testid={testId}
      {...rest}
    >
      <span className="rounded-full bg-white p-3 text-zinc-500 shadow-sm">
        <FqIcon name={icon} size={20} />
      </span>
      <h3 className="text-base font-semibold text-zinc-900">{title}</h3>
      {description ? <p className="max-w-md text-sm text-zinc-500">{description}</p> : null}
      {actionLabel ? (
        <FqButton size="sm" onClick={onAction}>
          {actionLabel}
        </FqButton>
      ) : null}
      {secondaryAction}
    </div>
  )
}
