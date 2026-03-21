import type { ReactNode } from 'react'

import * as Tooltip from '@radix-ui/react-tooltip'

import type { FqBaseProps } from '@/shared/ui/types'
import { cx } from '@/shared/utils'

type FqTooltipProps = FqBaseProps & {
  content: ReactNode
  children: ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
}

export function FqTooltip({
  content,
  children,
  side = 'top',
  className,
  
  testId,
}: FqTooltipProps) {
  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side={side}
            className={cx(
              'z-dropdown rounded-lg bg-zinc-900 px-2.5 py-1.5 text-xs text-white shadow-lg',
              className,
            )}
           
            data-testid={testId}
          >
            {content}
            <Tooltip.Arrow className="fill-zinc-900" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}
