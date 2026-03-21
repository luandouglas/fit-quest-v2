import type { ReactNode } from 'react'

import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

import { cx } from '@/shared/utils'
import type { FqBaseProps } from '@/shared/ui/types'

export type FqDropdownItem = {
  label: string
  onSelect?: () => void
  disabled?: boolean
}

type FqDropdownMenuProps = FqBaseProps & {
  trigger: ReactNode
  items: FqDropdownItem[]
}

export function FqDropdownMenu({
  trigger,
  items,
  className,
  
  testId,
}: FqDropdownMenuProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={cx(
            'z-dropdown min-w-48 rounded-lg border border-zinc-200 bg-white p-1.5 shadow-xl',
            className,
          )}
         
          data-testid={testId}
          sideOffset={8}
        >
          {items.map((item) => (
            <DropdownMenu.Item
              key={item.label}
              disabled={item.disabled}
              onSelect={item.onSelect}
              className={cx(
                'cursor-pointer rounded-lg px-3 py-2 text-sm text-zinc-700 outline-none transition',
                'focus-visible:bg-zinc-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
              )}
            >
              {item.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
