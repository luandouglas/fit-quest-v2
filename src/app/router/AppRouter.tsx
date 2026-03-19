import { Suspense, createElement, lazy } from "react";

import { IonRouterOutlet, IonSpinner } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Redirect, Route } from "react-router-dom";

import { appRoutePaths } from "@/app/router/routes";
import { NotFoundPage } from "@/app/pages/NotFoundPage";
import {
  PrivateRoute,
  PublicOnlyRoute,
  RoleGuard,
} from "@/app/router/guards/Guards";
import { TabsShellResolver } from "@/app/router/layouts";
import { LoginScreen, ResetPasswordPage, SignUpScreen } from "@/features/auth";
import { studentRoutes } from "@/features/student/routes";
import { AppErrorBoundary } from "@/shared/ui";

const LazyComponentsPageRoute = lazy(() =>
  import("@/app/pages/ComponentsPage").then((module) => ({
    default: module.ComponentsPage,
  })),
);

const LazyFitQuestExperiencePageRoute = lazy(() =>
  import("@/app/pages/experience/FitQuestExperiencePage").then((module) => ({
    default: module.FitQuestExperiencePage,
  })),
);

function RouteFallback() {
  return (
    <div className="app-route-loader" role="status" aria-live="polite">
      <IonSpinner name="crescent" />
      <span>Carregando...</span>
    </div>
  );
}

export function AppRouter() {
  // import.meta.env.BASE_URL é definido pelo Vite de acordo com a config `base`
  // Em prod: '/fit-quest-v2/' | Em dev: '/'
  // React Router v5 espera o basename sem trailing slash
  const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'

  return (
    <AppErrorBoundary>
      <IonReactRouter basename={basename}>
        <Suspense fallback={<RouteFallback />}>
          <IonRouterOutlet>
            <Route exact path={appRoutePaths.root}>
              <Redirect to={appRoutePaths.studentHome} />
            </Route>

            <Route exact path={appRoutePaths.components}>
              {createElement(LazyComponentsPageRoute)}
            </Route>

            <Route path={appRoutePaths.landing} exact>
              {createElement(LazyFitQuestExperiencePageRoute, {
                mode: "landing",
              })}
            </Route>

            <Route path={appRoutePaths.login} exact>
              <PublicOnlyRoute>
                <LoginScreen />
              </PublicOnlyRoute>
            </Route>

            <Route path={appRoutePaths.resetPassword} exact>
              <PublicOnlyRoute>
                <ResetPasswordPage />
              </PublicOnlyRoute>
            </Route>

            <Route path={appRoutePaths.signup} exact>
              <PublicOnlyRoute>
                <SignUpScreen />
              </PublicOnlyRoute>
            </Route>

            <Route path={appRoutePaths.tabs}>
              <PrivateRoute>
                <TabsShellResolver />
              </PrivateRoute>
            </Route>

            <Route path="/personal" exact>
              <PrivateRoute>
                <RoleGuard allowedRoles={["PERSONAL"]}>
                  <Redirect to="/tabs/personal/dashboard" />
                </RoleGuard>
              </PrivateRoute>
            </Route>

            <Route path="/nutritionist" exact>
              <PrivateRoute>
                <RoleGuard allowedRoles={["NUTRITIONIST"]}>
                  <Redirect to="/tabs/nutritionist/dashboard" />
                </RoleGuard>
              </PrivateRoute>
            </Route>

            <Route path={appRoutePaths.studentTrainingSession} exact>
              <PrivateRoute>
                <RoleGuard allowedRoles={["STUDENT", "PERSONAL"]}>
                  <Redirect to={studentRoutes.workoutSession} />
                </RoleGuard>
              </PrivateRoute>
            </Route>

            <Route path="/student/workout-log/create" exact>
              <PrivateRoute>
                <RoleGuard allowedRoles={["STUDENT"]}>
                  <Redirect to={studentRoutes.workoutLogCreate} />
                </RoleGuard>
              </PrivateRoute>
            </Route>

            <Route path="/student/water-log/create" exact>
              <PrivateRoute>
                <RoleGuard allowedRoles={["STUDENT"]}>
                  <Redirect to={studentRoutes.waterLogCreate} />
                </RoleGuard>
              </PrivateRoute>
            </Route>

            <Route path="/student/meal-log/create" exact>
              <PrivateRoute>
                <RoleGuard allowedRoles={["STUDENT"]}>
                  <Redirect to={studentRoutes.mealLogCreate} />
                </RoleGuard>
              </PrivateRoute>
            </Route>

            <Route
              path="/nutrition/meal/:mealId"
              exact
              render={({ match }) => (
                <PrivateRoute>
                  <RoleGuard allowedRoles={["STUDENT"]}>
                    <Redirect
                      to={`/tabs/nutrition/meal/${match.params.mealId}`}
                    />
                  </RoleGuard>
                </PrivateRoute>
              )}
            />

            <Route path="/nutrition/history" exact>
              <PrivateRoute>
                <RoleGuard allowedRoles={["STUDENT"]}>
                  <Redirect to="/tabs/nutrition/history" />
                </RoleGuard>
              </PrivateRoute>
            </Route>

            <Route path="/nutrition" exact>
              <PrivateRoute>
                <RoleGuard allowedRoles={["STUDENT"]}>
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
  );
}
