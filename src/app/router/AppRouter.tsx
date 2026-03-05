import { Suspense, createElement, lazy } from 'react'

import { IonRouterOutlet, IonSpinner } from '@ionic/react'
import { IonReactRouter } from '@ionic/react-router'
import { Redirect, Route } from 'react-router-dom'

import { AppTabsLayout } from '@/app/layouts'
import { NotFoundPage } from '@/app/pages/NotFoundPage'
import { PrivateRoute, PublicOnlyRoute, RoleGuard } from '@/app/router/Guards'
import { LoginPage } from '@/features/auth'
import { TrainingSessionPage } from '@/pages/training-plan'
import { AppErrorBoundary } from '@/shared/ui'

const LazyComponentsPageRoute = lazy(() =>
  import('@/app/pages/ComponentsPage').then((module) => ({ default: module.ComponentsPage })),
)

const LazyFitQuestExperiencePageRoute = lazy(() =>
  import('@/features/experience/pages/FitQuestExperiencePage').then((module) => ({
    default: module.FitQuestExperiencePage,
  })),
)

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
              {createElement(LazyComponentsPageRoute)}
            </Route>

            <Route path="/landing" exact>
              {createElement(LazyFitQuestExperiencePageRoute, { mode: 'landing' })}
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

            <Route path="/personal" exact>
              <PrivateRoute>
                <RoleGuard allowedRoles={['PERSONAL']}>
                  <Redirect to="/tabs/personal/dashboard" />
                </RoleGuard>
              </PrivateRoute>
            </Route>

            <Route path="/nutritionist" exact>
              <PrivateRoute>
                <RoleGuard allowedRoles={['NUTRITIONIST']}>
                  <Redirect to="/tabs/nutritionist/dashboard" />
                </RoleGuard>
              </PrivateRoute>
            </Route>

            <Route path="/treinos/sessao" exact>
              <PrivateRoute>
                <RoleGuard allowedRoles={['STUDENT', 'PERSONAL']}>
                  <TrainingSessionPage />
                </RoleGuard>
              </PrivateRoute>
            </Route>

            <Route
              path="/nutrition/meal/:mealId"
              exact
              render={({ match }) => (
                <PrivateRoute>
                  <RoleGuard allowedRoles={['STUDENT']}>
                    <Redirect to={`/tabs/nutrition/meal/${match.params.mealId}`} />
                  </RoleGuard>
                </PrivateRoute>
              )}
            />

            <Route path="/nutrition/history" exact>
              <PrivateRoute>
                <RoleGuard allowedRoles={['STUDENT']}>
                  <Redirect to="/tabs/nutrition/history" />
                </RoleGuard>
              </PrivateRoute>
            </Route>

            <Route path="/nutrition" exact>
              <PrivateRoute>
                <RoleGuard allowedRoles={['STUDENT']}>
                  <Redirect to="/tabs/nutrition" />
                </RoleGuard>
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
