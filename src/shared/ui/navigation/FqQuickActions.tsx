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
        'fixed bottom-20 right-4 z-30 flex flex-col gap-2 rounded-2xl border border-border/80 bg-card/95 p-2 shadow-lg backdrop-blur',
        mobileOnly ? 'lg:hidden' : '',
        className,
      )}
      data-testid={testId}
      {...rest}
    >
      {actions.map((action) => (
        <FqButton
          key={action.id}
          size="sm"
          tone={action.tone ?? 'primary'}
          leftIcon={action.icon}
          onClick={action.onClick}
          isDisabled={action.disabled}
          className="justify-start"
        >
          {action.label}
        </FqButton>
      ))}
    </div>
  )
}
