import type { ReactNode } from 'react'

import * as Dialog from '@radix-ui/react-dialog'

import { FqIconButton } from '@/shared/ui/primitives/FqIconButton'
import { cx } from '@/shared/utils'
import type { FqBaseProps } from '@/shared/ui/types'

type FqDrawerProps = FqBaseProps & {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  side?: 'left' | 'right'
  children: ReactNode
}

export function FqDrawer({
  open,
  onOpenChange,
  title,
  description,
  side = 'left',
  className,
  
  testId,
  children,
}: FqDrawerProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-zinc-900/50 backdrop-blur-sm" />
        <Dialog.Content
          className={cx(
            'fixed top-0 z-50 h-full w-[min(420px,88vw)] border-zinc-200 bg-white p-4 shadow-2xl',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
            side === 'left' ? 'left-0 border-r' : 'right-0 border-l',
            className,
          )}
         
          data-testid={testId}
        >
          <header className="mb-4 flex items-start justify-between gap-3 border-b border-zinc-100 pb-3">
            <div>
              {title ? (
                <Dialog.Title className="text-base font-semibold text-zinc-900">
                  {title}
                </Dialog.Title>
              ) : null}
              {description ? (
                <Dialog.Description className="text-sm text-zinc-500">
                  {description}
                </Dialog.Description>
              ) : null}
            </div>
            <Dialog.Close asChild>
              <FqIconButton icon="x" label="Fechar drawer" />
            </Dialog.Close>
          </header>
          <div className="h-[calc(100%-4rem)] overflow-y-auto">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
