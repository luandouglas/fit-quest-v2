import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react'

import { useAuth } from '@/shared/hooks'
import { StatusCard } from '@/shared/ui'

export function ProfilePage() {
  const { user, logout } = useAuth()

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonTitle>Perfil</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div className="fq-page-stack ion-padding">
          <StatusCard title="Atleta" tone="neutral">
            <IonText>
              Nome atual: <strong>{user?.name ?? 'Nao definido'}</strong>
            </IonText>
          </StatusCard>

          <StatusCard title="Conta" tone="warning">
            Logout limpa estado local (localStorage) para facilitar testes de fluxo.
          </StatusCard>

          <IonButton color="medium" fill="outline" expand="block" onClick={logout}>
            Sair
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  )
}
