import {
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from '@ionic/react'
import { homeOutline, personCircleOutline } from 'ionicons/icons'
import { Redirect, Route } from 'react-router-dom'

import { HomePage } from '@/features/home'
import { ProfilePage } from '@/features/profile'

export function AppTabsLayout() {
  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route path="/tabs/home" component={HomePage} exact />
        <Route path="/tabs/profile" component={ProfilePage} exact />
        <Route exact path="/tabs">
          <Redirect to="/tabs/home" />
        </Route>
      </IonRouterOutlet>

      <IonTabBar slot="bottom">
        <IonTabButton tab="home" href="/tabs/home">
          <IonIcon aria-hidden="true" icon={homeOutline} />
          <IonLabel>Home</IonLabel>
        </IonTabButton>

        <IonTabButton tab="profile" href="/tabs/profile">
          <IonIcon aria-hidden="true" icon={personCircleOutline} />
          <IonLabel>Profile</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  )
}
