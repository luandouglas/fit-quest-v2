import type { IconName } from "@/shared/ui";

export const personalRoutes = {
  root: "/tabs/personal",
  dashboard: "/tabs/personal/dashboard",
  students: "/tabs/personal/students",
  workouts: "/tabs/personal/workouts",
  metrics: "/tabs/personal/metrics",
  messages: "/tabs/personal/messages",
  profile: "/tabs/profile",
} as const;

export type PersonalNavigationKey =
  | "dashboard"
  | "students"
  | "workouts"
  | "metrics"
  | "messages"
  | "profile";

export type PersonalNavigationItem = {
  key: PersonalNavigationKey;
  label: string;
  icon: IconName;
  path: string;
  exact?: boolean;
};

export const personalNavigationItems: PersonalNavigationItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: "home",
    path: personalRoutes.dashboard,
    exact: true,
  },
  {
    key: "students",
    label: "Alunos",
    icon: "users",
    path: personalRoutes.students,
    exact: true,
  },
  {
    key: "workouts",
    label: "Treinos",
    icon: "dumbbell",
    path: personalRoutes.workouts,
  },
  {
    key: "metrics",
    label: "Metricas",
    icon: "chart",
    path: personalRoutes.metrics,
    exact: true,
  },
  {
    key: "messages",
    label: "Mensagens",
    icon: "bell",
    path: personalRoutes.messages,
    exact: true,
  },
  {
    key: "profile",
    label: "Perfil",
    icon: "user",
    path: personalRoutes.profile,
    exact: true,
  },
];
