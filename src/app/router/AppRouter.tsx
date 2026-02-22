import { Suspense } from 'react'

import { IonRouterOutlet, IonSpinner } from '@ionic/react'
import { IonReactRouter } from '@ionic/react-router'
import { Redirect, Route } from 'react-router-dom'

import { AppTabsLayout } from '@/app/layouts'
import { ComponentsPage, NotFoundPage } from '@/app/pages'
import { PrivateRoute, PublicOnlyRoute } from '@/app/router/Guards'
import { LoginPage } from '@/features/auth'
import { TrainingSessionPage } from '@/pages/training-plan'
import { AppErrorBoundary } from '@/shared/ui'

function RouteFallback() {
  return (
    <div className="app-route-loader" role="status" aria-live="polite">
      <IonSpinner name="crescent" />
      <span>Carregando...</span>
    </div>
  )
}

export function AppRouter() {
  return (
    <AppErrorBoundary>
      <IonReactRouter>
        <Suspense fallback={<RouteFallback />}>
          <IonRouterOutlet>
            <Route exact path="/">
              <Redirect to="/tabs/home" />
            </Route>

            <Route exact path="/components">
              <ComponentsPage />
            </Route>

            <Route path="/login" exact>
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            </Route>

            <Route path="/tabs">
              <PrivateRoute>
                <AppTabsLayout />
              </PrivateRoute>
            </Route>

            <Route path="/treinos/sessao" exact>
              <PrivateRoute>
                <TrainingSessionPage />
              </PrivateRoute>
            </Route>

            <Route
              path="/nutrition/meal/:mealId"
              exact
              render={({ match }) => (
                <PrivateRoute>
                  <Redirect to={`/tabs/nutrition/meal/${match.params.mealId}`} />
                </PrivateRoute>
              )}
            />

            <Route path="/nutrition/history" exact>
              <PrivateRoute>
                <Redirect to="/tabs/nutrition/history" />
              </PrivateRoute>
            </Route>

            <Route path="/nutrition" exact>
              <PrivateRoute>
                <Redirect to="/tabs/nutrition" />
              </PrivateRoute>
            </Route>

            <Route>
              <NotFoundPage />
            </Route>
          </IonRouterOutlet>
        </Suspense>
      </IonReactRouter>
    </AppErrorBoundary>
  )
}
