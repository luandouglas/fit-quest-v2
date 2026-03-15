import type { IconName } from "@/shared/ui";
import { studentRoutes } from "@/features/student/routes";

export type FitQuestTabKey = "home" | "workouts" | "nutrition" | "profile";

export type FitQuestTabItem = {
  key: FitQuestTabKey;
  label: string;
  icon: IconName;
  path: string;
  badge?: number | string;
  matches: (pathname: string) => boolean;
};

export type FitQuestQuickActionKey =
  | "log_workout"
  | "log_water"
  | "log_meal";

export type FitQuestQuickActionItem = {
  key: FitQuestQuickActionKey;
  label: string;
  caption: string;
  description: string;
  icon: IconName;
  path: string;
};

export const fitQuestStudentTabItems: FitQuestTabItem[] = [
  {
    key: "home",
    label: "Inicio",
    icon: "home",
    path: studentRoutes.hub,
    matches: (pathname) =>
      pathname === studentRoutes.hub || pathname === studentRoutes.legacyHome,
  },
  {
    key: "workouts",
    label: "Treinos",
    icon: "dumbbell",
    path: studentRoutes.workouts,
    matches: (pathname) =>
      pathname.startsWith(studentRoutes.workouts) ||
      pathname === studentRoutes.workoutLogCreate,
  },
  {
    key: "nutrition",
    label: "Nutricao",
    icon: "utensils",
    path: studentRoutes.nutrition,
    matches: (pathname) =>
      pathname.startsWith(studentRoutes.nutrition) ||
      pathname === studentRoutes.waterLogCreate ||
      pathname === studentRoutes.mealLogCreate,
  },
  {
    key: "profile",
    label: "Perfil",
    icon: "user",
    path: studentRoutes.profile,
    matches: (pathname) => pathname === studentRoutes.profile,
  },
];

export const fitQuestStudentQuickActions: FitQuestQuickActionItem[] = [
  {
    key: "log_workout",
    label: "Registrar treino",
    caption: "Treino",
    description: "Inicie ou retome o treino do dia em poucos toques.",
    icon: "dumbbell",
    path: studentRoutes.workoutLogCreate,
  },
  {
    key: "log_water",
    label: "Registrar agua",
    caption: "Agua",
    description: "Atualize sua hidratacao com um gesto rapido.",
    icon: "flask",
    path: studentRoutes.waterLogCreate,
  },
  {
    key: "log_meal",
    label: "Registrar refeicao",
    caption: "Refeicao",
    description: "Marque a proxima refeicao sem sair do fluxo.",
    icon: "utensils",
    path: studentRoutes.mealLogCreate,
  },
];

export function isFitQuestTabActive(
  item: FitQuestTabItem,
  pathname: string,
) {
  return item.matches(pathname);
}
