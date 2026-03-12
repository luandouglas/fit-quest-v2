import type { ReactNode } from "react";

import { Redirect, Route } from "react-router-dom";

import {
  RoleGuard,
  getDefaultTabsPathByRole,
} from "@/app/router/guards/Guards";
import { personalRoutes } from "@/features/personal/presentation/navigation";
import {
  PersonalDashboardPage,
  PersonalMessagesPage,
  PersonalMetricsPage,
  PersonalStudentsPage,
  PersonalWorkoutDetailPage,
  PersonalWorkoutsPage,
} from "@/features/personal/presentation/pages";
import type { AuthUserRole } from "@/shared/types";

function withPersonalGuard(role: AuthUserRole, element: ReactNode) {
  return (
    <RoleGuard
      allowedRoles={["PERSONAL"]}
      fallbackTo={getDefaultTabsPathByRole(role)}
    >
      {element}
    </RoleGuard>
  );
}

export function renderPersonalRoutes(role: AuthUserRole) {

  return [
    <Route
      key="personal-root"
      exact
      path={personalRoutes.root}
      render={() => <Redirect to={personalRoutes.dashboard} />}
    />,
    <Route
      key="personal-dashboard"
      exact
      path={personalRoutes.dashboard}
      render={() => withPersonalGuard(role, <PersonalDashboardPage />)}
    />,
    <Route
      key="personal-students"
      exact
      path={personalRoutes.students}
      render={() => withPersonalGuard(role, <PersonalStudentsPage />)}
    />,
    <Route
      key="personal-workouts"
      exact
      path={personalRoutes.workouts}
      render={() => withPersonalGuard(role, <PersonalWorkoutsPage />)}
    />,
    <Route
      key="personal-workout-detail"
      exact
      path={`${personalRoutes.workouts}/:workoutId`}
      render={() => withPersonalGuard(role, <PersonalWorkoutDetailPage />)}
    />,
    <Route
      key="personal-metrics"
      exact
      path={personalRoutes.metrics}
      render={() => withPersonalGuard(role, <PersonalMetricsPage />)}
    />,
    <Route
      key="personal-messages"
      exact
      path={personalRoutes.messages}
      render={() => withPersonalGuard(role, <PersonalMessagesPage />)}
    />,
  ];
}
