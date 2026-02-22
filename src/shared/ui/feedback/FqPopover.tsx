import type { ReactNode } from 'react'

import * as Popover from '@radix-ui/react-popover'

import type { FqBaseProps } from '@/shared/ui/types'
import { cx } from '@/shared/utils'

type FqPopoverProps = FqBaseProps & {
  trigger: ReactNode
  content: ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
}

export function FqPopover({
  trigger,
  content,
  side = 'bottom',
  className,
  
  testId,
}: FqPopoverProps) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>{trigger}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side={side}
          className={cx(
            'z-[80] w-64 rounded-xl border border-zinc-200 bg-white p-3 shadow-xl',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1',
            className,
          )}
         
          data-testid={testId}
        >
          {content}
          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
