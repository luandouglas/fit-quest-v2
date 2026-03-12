import type { ReactNode } from "react";

import { Redirect, Route } from "react-router-dom";

import {
  RoleGuard,
  getDefaultTabsPathByRole,
} from "@/app/router/guards/Guards";
import { nutritionistRoutes } from "@/features/nutritionist/presentation/navigation";
import {
  NutritionistAssessmentsPage,
  NutritionistDashboardPage,
  NutritionistDietsPage,
  NutritionistProgressPage,
  NutritionistStudentsPage,
} from "@/features/nutritionist/presentation/pages";
import type { AuthUserRole } from "@/shared/types";

function withNutritionistGuard(
  role: AuthUserRole,
  element: ReactNode,
) {
  return (
    <RoleGuard
      allowedRoles={["NUTRITIONIST"]}
      fallbackTo={getDefaultTabsPathByRole(role)}
    >
      {element}
    </RoleGuard>
  );
}

export function renderNutritionistRoutes(role: AuthUserRole) {

  return [
    <Route
      key="nutritionist-root"
      exact
      path={nutritionistRoutes.root}
      render={() => <Redirect to={nutritionistRoutes.dashboard} />}
    />,
    <Route
      key="nutritionist-dashboard"
      exact
      path={nutritionistRoutes.dashboard}
      render={() => withNutritionistGuard(role, <NutritionistDashboardPage />)}
    />,
    <Route
      key="nutritionist-students"
      exact
      path={nutritionistRoutes.students}
      render={() => withNutritionistGuard(role, <NutritionistStudentsPage />)}
    />,
    <Route
      key="nutritionist-diets"
      exact
      path={nutritionistRoutes.diets}
      render={() => withNutritionistGuard(role, <NutritionistDietsPage />)}
    />,
    <Route
      key="nutritionist-assessments"
      exact
      path={nutritionistRoutes.assessments}
      render={() =>
        withNutritionistGuard(role, <NutritionistAssessmentsPage />)
      }
    />,
    <Route
      key="nutritionist-progress"
      exact
      path={nutritionistRoutes.progress}
      render={() => withNutritionistGuard(role, <NutritionistProgressPage />)}
    />,
  ];
}
