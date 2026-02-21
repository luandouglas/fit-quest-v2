import { IonCard, IonCardContent, IonCardHeader, IonCardTitle } from '@ionic/react'

type StatusCardTone = 'neutral' | 'success' | 'warning'

type StatusCardProps = {
  title: string
  tone?: StatusCardTone
  children: React.ReactNode
}

export function StatusCard({ title, tone = 'neutral', children }: StatusCardProps) {
  return (
    <IonCard className={`fq-status-card fq-status-card--${tone}`}>
      <IonCardHeader>
        <IonCardTitle>{title}</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>{children}</IonCardContent>
    </IonCard>
  )
}
