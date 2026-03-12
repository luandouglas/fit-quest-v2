import { IonApp } from "@ionic/react";

import { AppProviders } from "@/app/providers";
import { AppRouter } from "@/app/router";

export function AppBootstrap() {
  return (
    <IonApp>
      <AppProviders>
        <AppRouter />
      </AppProviders>
    </IonApp>
  );
}
