import { IonButton, IonContent, IonPage, IonText, IonTitle } from '@ionic/react'
import { Link } from 'react-router-dom'

import { PageContainer } from '@/shared/ui'

export function NotFoundPage() {
  return (
    <IonPage>
      <IonContent fullscreen>
        <PageContainer centered>
          <IonText color="medium">Erro 404</IonText>
          <IonTitle>Pagina nao encontrada</IonTitle>
          <IonButton routerLink="/tabs/home" fill="solid">
            Ir para Home
          </IonButton>
          <IonText color="medium">
            Se preferir, acesse <Link to="/login">Login</Link>
          </IonText>
        </PageContainer>
      </IonContent>
    </IonPage>
  )
}
