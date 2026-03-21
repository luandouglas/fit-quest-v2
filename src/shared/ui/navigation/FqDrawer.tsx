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
  side?: 'left' | 'right' | 'bottom'
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
        <Dialog.Overlay className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm" />
        <Dialog.Content
          className={cx(
            'fixed z-50 flex border border-border bg-card p-4 shadow-2xl transition-transform duration-300 ease-out',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            side === 'left' && 'left-0 top-0 h-full w-full max-w-drawer border-r data-[state=closed]:-translate-x-full data-[state=open]:translate-x-0',
            side === 'right' && 'right-0 top-0 h-full w-full max-w-drawer border-l data-[state=closed]:translate-x-full data-[state=open]:translate-x-0',
            side === 'bottom' &&
              'bottom-0 left-0 right-0 mx-auto fq-h-modal-md w-full max-w-2xl rounded-t-xl border-x border-t data-[state=closed]:translate-y-full data-[state=open]:translate-y-0',
            className,
          )}
          data-testid={testId}
        >
          <div className="flex h-full w-full flex-col">
            {side === 'bottom' ? <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-border" /> : null}

            <header className="mb-4 flex items-start justify-between gap-3 border-b border-border/70 pb-3">
              <div>
                {title ? (
                  <Dialog.Title className="text-card-title font-semibold text-foreground">
                    {title}
                  </Dialog.Title>
                ) : null}
                {description ? (
                  <Dialog.Description className="text-sm text-muted-foreground">
                    {description}
                  </Dialog.Description>
                ) : null}
              </div>
              <Dialog.Close asChild>
                <FqIconButton icon="x" label="Fechar drawer" />
              </Dialog.Close>
            </header>
            <div className="flex-1 overflow-y-auto">{children}</div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
