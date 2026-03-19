import type { IconName } from "@/shared/ui";
import type { AuthUserRole } from "@/shared/types";
import { personalRoutes } from "@/features/personal/presentation/navigation";
import { studentRoutes } from "@/features/student/routes";

export type FitQuestTabKey = string;

export type FitQuestTabItem = {
  key: FitQuestTabKey;
  label: string;
  icon: IconName;
  path: string;
  badge?: number | string;
  matches: (pathname: string) => boolean;
};

export type FitQuestQuickActionKey = string;

export type FitQuestQuickActionItem = {
  key: FitQuestQuickActionKey;
  label: string;
  caption: string;
  description: string;
  icon: IconName;
  path: string;
};

export type FitQuestTabBarProfile = {
  role: AuthUserRole;
  navLabel: string;
  quickMenuLabel: string;
  openMenuLabel: string;
  closeMenuLabel: string;
};

export const fitQuestStudentTabBarProfile: FitQuestTabBarProfile = {
  role: "STUDENT",
  navLabel: "Navegacao principal do aluno",
  quickMenuLabel: "Acoes rapidas do aluno",
  openMenuLabel: "Abrir acoes rapidas do aluno",
  closeMenuLabel: "Fechar acoes rapidas do aluno",
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

export const fitQuestPersonalTabBarProfile: FitQuestTabBarProfile = {
  role: "PERSONAL",
  navLabel: "Navegacao principal do personal",
  quickMenuLabel: "Atalhos rapidos do personal",
  openMenuLabel: "Abrir atalhos rapidos do personal",
  closeMenuLabel: "Fechar atalhos rapidos do personal",
};

export const fitQuestPersonalTabItems: FitQuestTabItem[] = [
  {
    key: "dashboard",
    label: "Inicio",
    icon: "home",
    path: personalRoutes.dashboard,
    matches: (pathname) =>
      pathname === personalRoutes.root || pathname === personalRoutes.dashboard,
  },
  {
    key: "students",
    label: "Alunos",
    icon: "users",
    path: personalRoutes.students,
    matches: (pathname) => pathname === personalRoutes.students,
  },
  {
    key: "workouts",
    label: "Treinos",
    icon: "dumbbell",
    path: personalRoutes.workouts,
    matches: (pathname) => pathname.startsWith(personalRoutes.workouts),
  },
  {
    key: "profile",
    label: "Perfil",
    icon: "user",
    path: personalRoutes.profile,
    matches: (pathname) => pathname === personalRoutes.profile,
  },
];

export const fitQuestPersonalQuickActions: FitQuestQuickActionItem[] = [
  {
    key: "open_students",
    label: "Abrir alunos",
    caption: "Aluno",
    description: "Acesse a carteira de alunos e acompanhe os vinculos ativos.",
    icon: "users",
    path: personalRoutes.students,
  },
  {
    key: "create_workout",
    label: "Criar treino",
    caption: "Treino",
    description: "Abra o workspace de treino para montar um novo plano.",
    icon: "dumbbell",
    path: personalRoutes.workouts,
  },
  // {
  //   key: "open_metrics",
  //   label: "Ver metricas",
  //   caption: "Metricas",
  //   description: "Acompanhe adesao, volume e desempenho da carteira.",
  //   icon: "chart",
  //   path: personalRoutes.metrics,
  // },
];

export function isFitQuestTabActive(
  item: FitQuestTabItem,
  pathname: string,
) {
  return item.matches(pathname);
}
