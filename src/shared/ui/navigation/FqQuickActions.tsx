import type { HTMLAttributes } from 'react'

import { FqButton } from '@/shared/ui/primitives/FqButton'
import type { IconName } from '@/shared/ui/primitives/FqIcon'
import { cx } from '@/shared/utils'
import type { FqBaseProps, FqTone } from '@/shared/ui/types'

export type FqQuickActionItem = {
  id: string
  label: string
  icon: IconName
  onClick: () => void
  tone?: FqTone
  disabled?: boolean
}

type FqQuickActionsProps = FqBaseProps &
  Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'className'> & {
    actions: FqQuickActionItem[]
    mobileOnly?: boolean
  }

export function FqQuickActions({
  actions,
  mobileOnly = true,
  className,
  testId,
  ...rest
}: FqQuickActionsProps) {
  if (!actions.length) {
    return null
  }

  return (
    <div
      className={cx(
        'fixed inset-x-4 fq-quick-actions-fab z-30 grid gap-2 rounded-xl border border-border/80 bg-card/95 p-2 shadow-lg backdrop-blur',
        'sm:left-auto sm:right-4 sm:w-auto sm:min-w-60 sm:max-w-xs',
        mobileOnly ? 'lg:hidden' : '',
        className,
      )}
      data-testid={testId}
      {...rest}
    >
      {actions.map((action) => (
        <FqButton
          key={action.id}
          size="md"
          tone={action.tone ?? 'primary'}
          leftIcon={action.icon}
          onClick={action.onClick}
          isDisabled={action.disabled}
          className="min-h-12 justify-start text-left"
        >
          {action.label}
        </FqButton>
      ))}
    </div>
  )
}
