import { Suspense, lazy, type ReactNode } from "react";

import { Redirect, Route } from "react-router-dom";

import {
  RoleGuard,
  getDefaultTabsPathByRole,
} from "@/app/router/guards/Guards";
import { studentRoutes } from "@/features/student/routes";
import type { AuthUserRole } from "@/shared/types";

const StudentHubPage = lazy(() =>
  import("@/features/student/presentation/pages/StudentHubPage").then(
    (module) => ({
      default: module.StudentHubPage,
    }),
  ),
);

const StudentTrainingPlanPage = lazy(() =>
  import("@/features/student/presentation/pages/StudentTrainingPlanPage").then(
    (module) => ({
      default: module.StudentTrainingPlanPage,
    }),
  ),
);

const StudentTrainingSessionPage = lazy(() =>
  import(
    "@/features/student/presentation/pages/StudentTrainingSessionPage"
  ).then((module) => ({
    default: module.StudentTrainingSessionPage,
  })),
);

const StudentWorkoutDetailPage = lazy(() =>
  import("@/features/student/presentation/pages/StudentWorkoutDetailPage").then(
    (module) => ({
      default: module.StudentWorkoutDetailPage,
    }),
  ),
);

const StudentWorkoutCompletionPage = lazy(() =>
  import(
    "@/features/student/presentation/pages/StudentWorkoutCompletionPage"
  ).then((module) => ({
    default: module.StudentWorkoutCompletionPage,
  })),
);

const StudentNutritionPage = lazy(() =>
  import("@/features/student/presentation/pages/StudentNutritionPage").then(
    (module) => ({
      default: module.StudentNutritionPage,
    }),
  ),
);

const StudentRunPage = lazy(() =>
  import("@/features/student/presentation/pages/StudentRunPage").then(
    (module) => ({
      default: module.StudentRunPage,
    }),
  ),
);

const StudentRunActivityPage = lazy(() =>
  import("@/features/student/presentation/pages/StudentRunActivityPage").then(
    (module) => ({
      default: module.StudentRunActivityPage,
    }),
  ),
);

const StudentRunSummaryPage = lazy(() =>
  import("@/features/student/presentation/pages/StudentRunSummaryPage").then(
    (module) => ({
      default: module.StudentRunSummaryPage,
    }),
  ),
);

const StudentProgressPage = lazy(() =>
  import("@/features/student/presentation/pages/StudentProgressPage").then(
    (module) => ({
      default: module.StudentProgressPage,
    }),
  ),
);

const StudentGamificationPage = lazy(() =>
  import(
    "@/features/student/presentation/pages/StudentGamificationPage"
  ).then((module) => ({
    default: module.StudentGamificationPage,
  })),
);

const StudentRankingPage = lazy(() =>
  import("@/features/student/presentation/pages/StudentRankingPage").then(
    (module) => ({
      default: module.StudentRankingPage,
    }),
  ),
);

const StudentNotificationsPage = lazy(() =>
  import(
    "@/features/student/presentation/pages/StudentNotificationsPage"
  ).then((module) => ({
    default: module.StudentNotificationsPage,
  })),
);

function withStudentGuard(
  role: AuthUserRole,
  fallback: ReactNode,
  element: ReactNode,
) {
  return (
    <RoleGuard
      allowedRoles={["STUDENT"]}
      fallbackTo={getDefaultTabsPathByRole(role)}
    >
      <Suspense fallback={fallback}>{element}</Suspense>
    </RoleGuard>
  );
}

export function renderStudentRoutes(args: {
  role: AuthUserRole;
  fallback: ReactNode;
}) {
  const { role, fallback } = args;

  return [
    <Route
      key="student-home"
      path={studentRoutes.hub}
      exact
      render={() => withStudentGuard(role, fallback, <StudentHubPage />)}
    />,
    <Route
      key="student-workouts"
      path={studentRoutes.workouts}
      exact
      render={() =>
        withStudentGuard(role, fallback, <StudentTrainingPlanPage />)
      }
    />,
    <Route
      key="student-workout-completion"
      path={`${studentRoutes.workoutCompletionBase}/:sessionId`}
      exact
      render={() =>
        withStudentGuard(role, fallback, <StudentWorkoutCompletionPage />)
      }
    />,
    <Route
      key="student-workout-session"
      path={studentRoutes.workoutSession}
      exact
      render={() =>
        withStudentGuard(role, fallback, <StudentTrainingSessionPage />)
      }
    />,
    <Route
      key="student-workout-detail"
      path={`${studentRoutes.workouts}/:workoutId`}
      exact
      render={() => withStudentGuard(role, fallback, <StudentWorkoutDetailPage />)}
    />,
    <Route
      key="student-run"
      path={studentRoutes.cardio}
      exact
      render={() => withStudentGuard(role, fallback, <StudentRunPage />)}
    />,
    <Route
      key="student-run-session"
      path={studentRoutes.cardioSession}
      exact
      render={() => withStudentGuard(role, fallback, <StudentRunActivityPage />)}
    />,
    <Route
      key="student-run-summary"
      path={`${studentRoutes.cardioSummaryBase}/:sessionId`}
      exact
      render={() => withStudentGuard(role, fallback, <StudentRunSummaryPage />)}
    />,
    <Route
      key="student-nutrition-meal"
      path={`${studentRoutes.nutrition}/meal/:mealId`}
      exact
      render={() => withStudentGuard(role, fallback, <StudentNutritionPage />)}
    />,
    <Route
      key="student-nutrition-history"
      path={`${studentRoutes.nutrition}/history`}
      exact
      render={() => withStudentGuard(role, fallback, <StudentNutritionPage />)}
    />,
    <Route
      key="student-nutrition"
      path={studentRoutes.nutrition}
      exact
      render={() => withStudentGuard(role, fallback, <StudentNutritionPage />)}
    />,
    <Route
      key="student-progress"
      path={studentRoutes.progress}
      exact
      render={() => <Suspense fallback={fallback}><StudentProgressPage /></Suspense>}
    />,
    <Route
      key="student-gamification"
      path={studentRoutes.rewards}
      exact
      render={() =>
        withStudentGuard(role, fallback, <StudentGamificationPage />)
      }
    />,
    <Route
      key="student-ranking"
      path={studentRoutes.ranking}
      exact
      render={() => <Suspense fallback={fallback}><StudentRankingPage /></Suspense>}
    />,
    <Route
      key="student-notifications"
      path={studentRoutes.notifications}
      exact
      render={() =>
        <Suspense fallback={fallback}>
          <StudentNotificationsPage />
        </Suspense>
      }
    />,
    <Route
      key="student-home-legacy"
      path={studentRoutes.legacyHome}
      exact
      render={() => <Redirect to={studentRoutes.hub} />}
    />,
  ];
}
