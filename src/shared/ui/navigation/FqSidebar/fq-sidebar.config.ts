import type { AuthUserRole } from "@/shared/types";

import type { FqSidebarRoleConfig } from "./fq-sidebar.types";

// ─── Student ───────────────────────────────────────────────────────

const studentConfig: FqSidebarRoleConfig = {
  role: "STUDENT",
  roleLabel: "Aluno",
  roleIcon: "dumbbell",
  railItems: [
    { id: "home", icon: "home", label: "Inicio", path: "/tabs/student" },
    {
      id: "workouts",
      icon: "dumbbell",
      label: "Treinos",
      path: "/tabs/workouts",
      matcher: (p) => p.startsWith("/tabs/workouts"),
    },
    {
      id: "nutrition",
      icon: "utensils",
      label: "Nutricao",
      path: "/tabs/nutrition",
      matcher: (p) => p.startsWith("/tabs/nutrition"),
    },
    {
      id: "progress",
      icon: "chart",
      label: "Progresso",
      path: "/tabs/progress",
      matcher: (p) => p.startsWith("/tabs/progress"),
    },
    {
      id: "gamification",
      icon: "trophy",
      label: "Conquistas",
      path: "/tabs/gamification",
      matcher: (p) => p.startsWith("/tabs/gamification"),
    },
  ],
  sections: [
    {
      id: "overview",
      title: "Visao geral",
      items: [
        {
          id: "home",
          label: "Inicio",
          icon: "home",
          path: "/tabs/student",
          exact: true,
        },
        {
          id: "progress",
          label: "Progresso",
          icon: "chart",
          path: "/tabs/progress",
          matcher: (p) => p.startsWith("/tabs/progress"),
        },
        {
          id: "notifications",
          label: "Notificacoes",
          icon: "bell",
          path: "/tabs/notifications",
          exact: true,
        },
      ],
    },
    {
      id: "routine",
      title: "Rotina",
      items: [
        {
          id: "workouts",
          label: "Treinos",
          icon: "dumbbell",
          path: "/tabs/workouts",
          matcher: (p) => p.startsWith("/tabs/workouts"),
        },
        {
          id: "cardio",
          label: "Cardio",
          icon: "activity",
          path: "/tabs/run",
          matcher: (p) => p.startsWith("/tabs/run"),
        },
        {
          id: "nutrition",
          label: "Nutricao",
          icon: "utensils",
          path: "/tabs/nutrition",
          matcher: (p) => p.startsWith("/tabs/nutrition"),
        },
      ],
    },
    {
      id: "engagement",
      title: "Engajamento",
      items: [
        {
          id: "gamification",
          label: "Conquistas",
          icon: "trophy",
          path: "/tabs/gamification",
          matcher: (p) => p.startsWith("/tabs/gamification"),
        },
        {
          id: "ranking",
          label: "Ranking",
          icon: "flame",
          path: "/tabs/ranking",
          exact: true,
        },
      ],
    },
    {
      id: "account",
      title: "Conta",
      items: [
        {
          id: "profile",
          label: "Perfil",
          icon: "user",
          path: "/tabs/profile",
          exact: true,
        },
        {
          id: "settings",
          label: "Configuracoes",
          icon: "settings",
          path: "/tabs/settings",
          exact: true,
        },
      ],
    },
  ],
  footerCard: {
    title: "Continue evoluindo",
    description: "Complete seus treinos e conquiste novas medalhas.",
    icon: "target",
    actionLabel: "Ver metas",
    actionPath: "/tabs/gamification",
  },
};

// ─── Personal ──────────────────────────────────────────────────────

const personalConfig: FqSidebarRoleConfig = {
  role: "PERSONAL",
  roleLabel: "Personal Trainer",
  roleIcon: "activity",
  railItems: [
    {
      id: "dashboard",
      icon: "home",
      label: "Dashboard",
      path: "/tabs/personal/dashboard",
    },
    {
      id: "students",
      icon: "users",
      label: "Alunos",
      path: "/tabs/personal/students",
      matcher: (p) => p.startsWith("/tabs/personal/students"),
    },
    {
      id: "workouts",
      icon: "dumbbell",
      label: "Treinos",
      path: "/tabs/personal/workouts",
      matcher: (p) => p.startsWith("/tabs/personal/workouts"),
    },
    // {
    //   id: "metrics",
    //   icon: "chart",
    //   label: "Metricas",
    //   path: "/tabs/personal/metrics",
    //   matcher: (p) => p.startsWith("/tabs/personal/metrics"),
    // },
    {
      id: "messages",
      icon: "bell",
      label: "Mensagens",
      path: "/tabs/personal/messages",
      matcher: (p) => p.startsWith("/tabs/personal/messages"),
    },
  ],
  sections: [
    {
      id: "overview",
      title: "Visao geral",
      items: [
        {
          id: "dashboard",
          label: "Dashboard",
          icon: "home",
          path: "/tabs/personal/dashboard",
          exact: true,
        },
        {
          id: "calendar",
          label: "Agenda",
          icon: "calendar",
          path: "/tabs/personal/calendar",
          exact: true,
        },
      ],
    },
    {
      id: "management",
      title: "Gestao de alunos",
      items: [
        {
          id: "students",
          label: "Alunos",
          icon: "users",
          path: "/tabs/personal/students",
          matcher: (p) => p.startsWith("/tabs/personal/students"),
        },
        {
          id: "workouts",
          label: "Prescricao de treinos",
          icon: "dumbbell",
          path: "/tabs/personal/workouts",
          matcher: (p) => p.startsWith("/tabs/personal/workouts"),
        },
        {
          id: "metrics",
          label: "Evolucao",
          icon: "chart",
          path: "/tabs/personal/metrics",
          matcher: (p) => p.startsWith("/tabs/personal/metrics"),
        },
      ],
    },
    {
      id: "tracking",
      title: "Acompanhamento",
      items: [
        {
          id: "messages",
          label: "Mensagens",
          icon: "bell",
          path: "/tabs/personal/messages",
          matcher: (p) => p.startsWith("/tabs/personal/messages"),
        },
      ],
    },
    {
      id: "account",
      title: "Conta",
      items: [
        {
          id: "profile",
          label: "Perfil",
          icon: "user",
          path: "/tabs/profile",
          exact: true,
        },
        {
          id: "settings",
          label: "Configuracoes",
          icon: "settings",
          path: "/tabs/settings",
          exact: true,
        },
      ],
    },
  ],
  footerCard: {
    title: "Seus alunos contam com voce",
    description: "Acompanhe a evolucao e mantenha todos motivados.",
    icon: "users",
    actionLabel: "Ver alunos",
    actionPath: "/tabs/personal/students",
  },
};

// ─── Nutritionist ──────────────────────────────────────────────────

const nutritionistConfig: FqSidebarRoleConfig = {
  role: "NUTRITIONIST",
  roleLabel: "Nutricionista",
  roleIcon: "flask",
  railItems: [
    {
      id: "dashboard",
      icon: "home",
      label: "Dashboard",
      path: "/tabs/nutritionist/dashboard",
    },
    {
      id: "students",
      icon: "users",
      label: "Pacientes",
      path: "/tabs/nutritionist/students",
      matcher: (p) => p.startsWith("/tabs/nutritionist/students"),
    },
    {
      id: "diets",
      icon: "utensils",
      label: "Planos",
      path: "/tabs/nutritionist/diets",
      matcher: (p) => p.startsWith("/tabs/nutritionist/diets"),
    },
    {
      id: "assessments",
      icon: "list",
      label: "Avaliacoes",
      path: "/tabs/nutritionist/assessments",
      matcher: (p) => p.startsWith("/tabs/nutritionist/assessments"),
    },
    {
      id: "progress",
      icon: "activity",
      label: "Evolucao",
      path: "/tabs/nutritionist/progress",
      matcher: (p) => p.startsWith("/tabs/nutritionist/progress"),
    },
  ],
  sections: [
    {
      id: "overview",
      title: "Visao geral",
      items: [
        {
          id: "dashboard",
          label: "Dashboard",
          icon: "home",
          path: "/tabs/nutritionist/dashboard",
          exact: true,
        },
        {
          id: "calendar",
          label: "Agenda",
          icon: "calendar",
          path: "/tabs/nutritionist/calendar",
          exact: true,
        },
      ],
    },
    {
      id: "clinical",
      title: "Gestao clinica",
      items: [
        {
          id: "students",
          label: "Pacientes",
          icon: "users",
          path: "/tabs/nutritionist/students",
          matcher: (p) => p.startsWith("/tabs/nutritionist/students"),
        },
        {
          id: "assessments",
          label: "Avaliacoes",
          icon: "list",
          path: "/tabs/nutritionist/assessments",
          matcher: (p) => p.startsWith("/tabs/nutritionist/assessments"),
        },
        {
          id: "progress",
          label: "Evolucao",
          icon: "activity",
          path: "/tabs/nutritionist/progress",
          matcher: (p) => p.startsWith("/tabs/nutritionist/progress"),
        },
      ],
    },
    {
      id: "nutrition",
      title: "Nutricao",
      items: [
        {
          id: "diets",
          label: "Planos alimentares",
          icon: "utensils",
          path: "/tabs/nutritionist/diets",
          matcher: (p) => p.startsWith("/tabs/nutritionist/diets"),
        },
      ],
    },
    {
      id: "account",
      title: "Conta",
      items: [
        {
          id: "profile",
          label: "Perfil",
          icon: "user",
          path: "/tabs/profile",
          exact: true,
        },
        {
          id: "settings",
          label: "Configuracoes",
          icon: "settings",
          path: "/tabs/settings",
          exact: true,
        },
      ],
    },
  ],
  footerCard: {
    title: "Acompanhe seus pacientes",
    description: "Monitore adesao alimentar e ajuste planos.",
    icon: "heart",
    actionLabel: "Ver pacientes",
    actionPath: "/tabs/nutritionist/students",
  },
};

// ─── Config map ────────────────────────────────────────────────────

const sidebarConfigByRole: Record<AuthUserRole, FqSidebarRoleConfig> = {
  STUDENT: studentConfig,
  PERSONAL: personalConfig,
  NUTRITIONIST: nutritionistConfig,
};

export function getSidebarConfig(role: AuthUserRole): FqSidebarRoleConfig {
  return sidebarConfigByRole[role];
}
