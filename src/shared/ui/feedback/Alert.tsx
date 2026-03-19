import { IonAlert } from '@ionic/react'

import type { FqBaseProps } from '@/shared/ui/types'

type AlertProps = FqBaseProps & {
  isOpen: boolean
  header?: string
  message: string
  onDidDismiss?: () => void
  buttonText?: string
}

export function Alert({
  isOpen,
  header,
  message,
  onDidDismiss,
  buttonText = 'Ok',
  testId,
}: AlertProps) {
  return (
    <IonAlert
      isOpen={isOpen}
      header={header}
      message={message}
      onDidDismiss={onDidDismiss}
      buttons={[buttonText]}
      data-testid={testId}
    />
  )
}
