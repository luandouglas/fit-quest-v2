import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";

import { useAuth } from "@/shared/hooks";
import { StatusCard } from "@/shared/ui";

export function HomePage() {
  const { user } = useAuth();

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonTitle>FitQuest</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div className="fq-page-stack ion-padding">
          <h1 className="fq-headline">Bem-vindo, {user?.name ?? "atleta"}.</h1>
          <IonText color="medium">
            Estrutura pronta para evoluir autenticacao, onboarding e trilhas
            fitness.
          </IonText>

          <StatusCard title="Status do projeto" tone="success">
            Base React + Ionic + Capacitor configurada para Web, Android e iOS.
          </StatusCard>

          <IonButton routerLink="/tabs/profile" expand="block">
            Ver perfil
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
}
