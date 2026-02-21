import { useState } from 'react'

import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonInput,
  IonItem,
  IonPage,
} from '@ionic/react'

import { useAuth } from '@/shared/hooks'
import { PageContainer } from '@/shared/ui'

export function LoginPage() {
  const [name, setName] = useState('')
  const { login } = useAuth()

  const isDisabled = name.trim().length < 2

  function handleLogin() {
    if (isDisabled) {
      return
    }

    login({ id: crypto.randomUUID(), name: name.trim() })
  }

  return (
    <IonPage>
      <IonContent fullscreen>
        <PageContainer centered>
          <IonCard className="fq-login-card">
            <IonCardHeader>
              <IonCardSubtitle>FitQuest</IonCardSubtitle>
              <IonCardTitle>Acesse sua jornada</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonItem lines="none">
                <IonInput
                  label="Seu nome"
                  labelPlacement="stacked"
                  placeholder="Ex.: Luan"
                  value={name}
                  onIonInput={(event) => setName(event.detail.value ?? '')}
                />
              </IonItem>

              <IonButton expand="block" onClick={handleLogin} disabled={isDisabled}>
                Entrar
              </IonButton>
            </IonCardContent>
          </IonCard>
        </PageContainer>
      </IonContent>
    </IonPage>
  )
}
