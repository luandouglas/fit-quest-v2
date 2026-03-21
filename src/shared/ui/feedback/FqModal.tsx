import type { ReactNode } from 'react'

import * as Dialog from '@radix-ui/react-dialog'

import { FqIconButton } from '@/shared/ui/primitives/FqIconButton'
import { cx } from '@/shared/utils'
import type { FqBaseProps } from '@/shared/ui/types'

type FqModalProps = FqBaseProps & {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  bodyClassName?: string
}

export function FqModal({
  open,
  onOpenChange,
  title,
  description,
  className,
  bodyClassName,
  testId,
  children,
  footer,
}: FqModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-zinc-900/50 backdrop-blur-sm" />
        <Dialog.Content
          className={cx(
            'fixed left-1/2 top-1/2 z-modal overflow-hidden w-full max-w-modal -translate-x-1/2 -translate-y-1/2 rounded-lg border border-zinc-200 bg-white p-5 shadow-xl',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
            className,
          )}
         
          data-testid={testId}
        >
          <header className="mb-4 flex items-start justify-between gap-4 border-b border-zinc-100 pb-3">
            <div>
              {title ? (
                <Dialog.Title className="text-card-title font-semibold text-foreground">{title}</Dialog.Title>
              ) : null}
              {description ? (
                <Dialog.Description className="text-sm text-zinc-500">
                  {description}
                </Dialog.Description>
              ) : null}
            </div>
            <Dialog.Close asChild>
              <FqIconButton icon="x" label="Fechar modal" />
            </Dialog.Close>
          </header>
          <div className={cx('fq-max-h-panel overflow-x-hidden overflow-y-auto pr-2', bodyClassName)}>{children}</div>
          {footer ? <footer className="mt-4 border-t border-zinc-100 pt-3">{footer}</footer> : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
