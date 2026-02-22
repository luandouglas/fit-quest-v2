import type { ReactNode } from 'react'

import { FqButton } from '@/shared/ui/primitives/FqButton'
import { FqModal } from '@/shared/ui/feedback/FqModal'
import type { FqBaseProps, FqTone } from '@/shared/ui/types'

type FqDialogProps = FqBaseProps & {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  children?: ReactNode
  confirmText?: string
  cancelText?: string
  tone?: FqTone
  onConfirm?: () => void
  onCancel?: () => void
}

export function FqDialog({
  open,
  onOpenChange,
  title = 'Confirmação',
  description,
  children,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  tone = 'primary',
  onConfirm,
  onCancel,
  ...rest
}: FqDialogProps) {
  return (
    <FqModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      footer={
        <div className="flex justify-end gap-2">
          <FqButton
            variant="ghost"
            tone="neutral"
            onClick={() => {
              onCancel?.()
              onOpenChange(false)
            }}
          >
            {cancelText}
          </FqButton>
          <FqButton
            tone={tone}
            onClick={() => {
              onConfirm?.()
              onOpenChange(false)
            }}
          >
            {confirmText}
          </FqButton>
        </div>
      }
      {...rest}
    >
      {children}
    </FqModal>
  )
}
