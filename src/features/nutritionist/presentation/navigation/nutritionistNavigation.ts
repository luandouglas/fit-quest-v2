import type { IconName } from "@/shared/ui";

export const nutritionistRoutes = {
  root: "/tabs/nutritionist",
  dashboard: "/tabs/nutritionist/dashboard",
  students: "/tabs/nutritionist/students",
  diets: "/tabs/nutritionist/diets",
  assessments: "/tabs/nutritionist/assessments",
  progress: "/tabs/nutritionist/progress",
  profile: "/tabs/profile",
} as const;

export type NutritionistNavigationKey =
  | "dashboard"
  | "students"
  | "diets"
  | "assessments"
  | "progress"
  | "profile";

export type NutritionistNavigationItem = {
  key: NutritionistNavigationKey;
  label: string;
  icon: IconName;
  path: string;
  exact?: boolean;
};

export const nutritionistNavigationItems: NutritionistNavigationItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: "home",
    path: nutritionistRoutes.dashboard,
    exact: true,
  },
  {
    key: "students",
    label: "Alunos",
    icon: "users",
    path: nutritionistRoutes.students,
    exact: true,
  },
  {
    key: "diets",
    label: "Dietas",
    icon: "utensils",
    path: nutritionistRoutes.diets,
    exact: true,
  },
  {
    key: "assessments",
    label: "Avaliacoes",
    icon: "list",
    path: nutritionistRoutes.assessments,
    exact: true,
  },
  {
    key: "progress",
    label: "Progresso Nutricional",
    icon: "activity",
    path: nutritionistRoutes.progress,
    exact: true,
  },
  {
    key: "profile",
    label: "Perfil",
    icon: "user",
    path: nutritionistRoutes.profile,
    exact: true,
  },
];
