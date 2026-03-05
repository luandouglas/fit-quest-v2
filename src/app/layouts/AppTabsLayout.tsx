import { Suspense, lazy, useMemo, useState } from "react";

import { IonSpinner } from "@ionic/react";
import { useQuery } from "@tanstack/react-query";
import {
  Redirect,
  Route,
  NavLink,
  Switch,
  useHistory,
  useLocation,
} from "react-router-dom";

import { RoleGuard, getDefaultTabsPathByRole } from "@/app/router/Guards";
import { HomePage } from "@/features/home";
import { useNotificationsInbox } from "@/features/notifications/hooks/useNotificationsInbox";
import { NutritionistDashboardPage } from "@/features/nutritionist";
import { PersonalDashboardPage } from "@/features/personal";
import { ProfilePage } from "@/features/profile";
import { gamificationService } from "@/shared/services";
import { useAuth, useRole } from "@/shared/hooks";
import { FqBreadcrumb, FqButton, FqIcon, FqText } from "@/shared/ui";
import type { IconName } from "@/shared/ui";
import type { AuthUserRole } from "@/shared/types";
import { cx } from "@/shared";

const TrainingPlanPage = lazy(() =>
  import("@/pages/training-plan/TrainingPlanPage").then((module) => ({
    default: module.TrainingPlanPage,
  })),
);

const TrainingSessionPage = lazy(() =>
  import("@/pages/training-plan/TrainingSessionPage").then((module) => ({
    default: module.TrainingSessionPage,
  })),
);

const NutritionPage = lazy(() =>
  import("@/features/nutrition/pages/NutritionPage").then((module) => ({
    default: module.NutritionPage,
  })),
);

const RunTabLazy = lazy(() =>
  import("@/features/run/pages/RunPage").then((module) => ({
    default: module.RunPage,
  })),
);

const ProgressTabLazy = lazy(() =>
  import("@/features/progress/pages/ProgressPage").then((module) => ({
    default: module.ProgressPage,
  })),
);

const GamificationTabLazy = lazy(() =>
  import("@/features/gamification/pages/GamificationPage").then((module) => ({
    default: module.GamificationPage,
  })),
);

const RankingTabLazy = lazy(() =>
  import("@/features/ranking/pages/RankingPage").then((module) => ({
    default: module.RankingPage,
  })),
);

const NotificationsTabLazy = lazy(() =>
  import("@/features/notifications/pages/NotificationsPage").then((module) => ({
    default: module.NotificationsPage,
  })),
);

type SidebarItem = {
  label: string;
  icon: IconName;
  path: string;
  exact?: boolean;
  badge?: number;
  roles: AuthUserRole[];
  showInBottomNav?: boolean;
};

type SidebarTheme = {
  container: string;
  headerAvatar: string;
  hoverItem: string;
  activeItem: string;
  mobileTop: string;
};

type LayoutRouteMeta = {
  title: string;
  parent?: string;
};

function getSidebarTheme(role: AuthUserRole): SidebarTheme {
  if (role === "PERSONAL") {
    return {
      container: "bg-card",
      headerAvatar: "bg-secondary/15 text-secondary",
      hoverItem: "hover:bg-secondary/10 hover:text-secondary",
      activeItem: "bg-secondary/15 text-secondary",
      mobileTop: "bg-card",
    };
  }

  if (role === "NUTRITIONIST") {
    return {
      container: "bg-card",
      headerAvatar: "bg-tertiary/15 text-tertiary",
      hoverItem: "hover:bg-tertiary/10 hover:text-tertiary",
      activeItem: "bg-tertiary/15 text-tertiary",
      mobileTop: "bg-card",
    };
  }

  return {
    container: "bg-card",
    headerAvatar: "bg-primary/15 text-primary",
    hoverItem: "hover:bg-primary/10 hover:text-primary",
    activeItem: "bg-primary/15 text-primary",
    mobileTop: "bg-card",
  };
}

function getRoleMenu(role: AuthUserRole, unreadCount: number): SidebarItem[] {
  if (role === "PERSONAL") {
    return [
      {
        label: "Dashboard",
        icon: "home",
        path: "/tabs/personal/dashboard",
        exact: true,
        roles: ["PERSONAL"],
      },
      {
        label: "Alunos",
        icon: "users",
        path: "/tabs/personal/students",
        exact: true,
        roles: ["PERSONAL"],
      },
      {
        label: "Treinos",
        icon: "dumbbell",
        path: "/tabs/personal/workouts",
        exact: false,
        roles: ["PERSONAL"],
      },
      {
        label: "Metricas",
        icon: "chart",
        path: "/tabs/personal/metrics",
        exact: true,
        roles: ["PERSONAL"],
      },
      {
        label: "Mensagens",
        icon: "bell",
        path: "/tabs/personal/messages",
        exact: true,
        roles: ["PERSONAL"],
      },
      {
        label: "Perfil",
        icon: "user",
        path: "/tabs/profile",
        exact: true,
        roles: ["PERSONAL"],
      },
    ];
  }

  if (role === "NUTRITIONIST") {
    return [
      {
        label: "Dashboard",
        icon: "home",
        path: "/tabs/nutritionist/dashboard",
        exact: true,
        roles: ["NUTRITIONIST"],
      },
      {
        label: "Alunos",
        icon: "users",
        path: "/tabs/nutritionist/students",
        exact: true,
        roles: ["NUTRITIONIST"],
      },
      {
        label: "Dietas",
        icon: "utensils",
        path: "/tabs/nutritionist/diets",
        exact: true,
        roles: ["NUTRITIONIST"],
      },
      {
        label: "Avaliacoes",
        icon: "list",
        path: "/tabs/nutritionist/assessments",
        exact: true,
        roles: ["NUTRITIONIST"],
      },
      {
        label: "Progresso Nutricional",
        icon: "activity",
        path: "/tabs/nutritionist/progress",
        exact: true,
        roles: ["NUTRITIONIST"],
      },
      {
        label: "Perfil",
        icon: "user",
        path: "/tabs/profile",
        exact: true,
        roles: ["NUTRITIONIST"],
      },
    ];
  }

  return [
    {
      label: "Inicio",
      icon: "home",
      path: "/tabs/home",
      exact: true,
      roles: ["STUDENT"],
    },
    {
      label: "Treinos",
      icon: "dumbbell",
      path: "/tabs/workouts",
      exact: true,
      roles: ["STUDENT"],
    },
    {
      label: "Corrida",
      icon: "mapPin",
      path: "/tabs/run",
      exact: true,
      roles: ["STUDENT"],
    },
    {
      label: "Nutricao",
      icon: "utensils",
      path: "/tabs/nutrition",
      roles: ["STUDENT"],
      showInBottomNav: false,
    },
    {
      label: "Progresso",
      icon: "chart",
      path: "/tabs/progress",
      exact: true,
      roles: ["STUDENT"],
    },
    {
      label: "Gamificacao",
      icon: "gamepad",
      path: "/tabs/gamification",
      exact: true,
      roles: ["STUDENT"],
      showInBottomNav: false,
    },
    {
      label: "Ranking",
      icon: "trophy",
      path: "/tabs/ranking",
      exact: true,
      roles: ["STUDENT"],
      showInBottomNav: false,
    },
    {
      label: "Notificacoes",
      icon: "bell",
      path: "/tabs/notifications",
      exact: true,
      badge: unreadCount > 0 ? unreadCount : undefined,
      roles: ["STUDENT"],
    },
    {
      label: "Perfil",
      icon: "user",
      path: "/tabs/profile",
      exact: true,
      roles: ["STUDENT"],
    },
  ];
}

function getRouteMeta(pathname: string): LayoutRouteMeta {
  if (pathname.startsWith("/tabs/nutrition/meal/")) {
    return { title: "Detalhe da refeicao", parent: "Nutricao" };
  }

  if (pathname === "/tabs/nutrition/history") {
    return { title: "Historico", parent: "Nutricao" };
  }

  if (pathname.startsWith("/tabs/personal/")) {
    if (pathname.startsWith("/tabs/personal/workouts/")) {
      return {
        title: "Detalhes da ficha",
        parent: "Personal",
      };
    }

    const section = pathname.split("/")[3] ?? "dashboard";
    const sectionMap: Record<string, string> = {
      dashboard: "Dashboard",
      students: "Alunos",
      workouts: "Treinos",
      metrics: "Metricas",
      messages: "Mensagens",
    };

    return {
      title: sectionMap[section] ?? "Dashboard",
      parent: "Personal",
    };
  }

  if (pathname.startsWith("/tabs/nutritionist/")) {
    const section = pathname.split("/")[3] ?? "dashboard";
    const sectionMap: Record<string, string> = {
      dashboard: "Dashboard",
      students: "Alunos",
      diets: "Dietas",
      assessments: "Avaliacoes",
      progress: "Progresso Nutricional",
    };

    return {
      title: sectionMap[section] ?? "Dashboard",
      parent: "Nutricionista",
    };
  }

  const labelMap: Record<string, string> = {
    "/tabs/home": "Inicio",
    "/tabs/workouts": "Treinos",
    "/tabs/workouts/session": "Sessao de treino",
    "/tabs/run": "Corrida",
    "/tabs/nutrition": "Nutricao",
    "/tabs/progress": "Progresso",
    "/tabs/gamification": "Gamificacao",
    "/tabs/ranking": "Ranking",
    "/tabs/notifications": "Notificacoes",
    "/tabs/profile": "Perfil",
  };

  return {
    title: labelMap[pathname] ?? "FitQuest",
  };
}

function TopHeader({
  title,
  parent,
  role,
  userName,
  userInitials,
  studentLevel,
  canOpenMenu,
  onOpenMenu,
  onNavigate,
}: {
  title: string;
  parent?: string;
  role: AuthUserRole;
  userName: string;
  userInitials: string;
  studentLevel: number | null;
  canOpenMenu: boolean;
  onOpenMenu: () => void;
  onNavigate: (path: string) => void;
}) {
  const breadcrumbItems = [
    {
      label:
        role === "STUDENT"
          ? "Aluno"
          : role === "PERSONAL"
            ? "Personal"
            : "Nutricionista",
      onClick: () => onNavigate(getDefaultTabsPathByRole(role)),
    },
    ...(parent
      ? [
          {
            label: parent,
            onClick: () =>
              onNavigate(
                parent === "Nutricao"
                  ? "/tabs/nutrition"
                  : getDefaultTabsPathByRole(role),
              ),
          },
        ]
      : []),
    { label: title, isCurrent: true },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/95 backdrop-blur">
      <div className="fq-fitness-glow mx-auto flex w-full items-start justify-between gap-3 px-4 py-3 md:px-6 md:py-4 lg:px-8">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          {canOpenMenu ? (
            <button
              type="button"
              aria-label="Abrir menu"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-foreground lg:hidden"
              onClick={onOpenMenu}
            >
              <FqIcon name="menu" />
            </button>
          ) : (
            <div className="h-11 w-11 shrink-0 lg:hidden" />
          )}
          <div className="min-w-0 space-y-1">
            <div className="inline-flex items-center gap-2">
              <FqIcon
                name={
                  role === "STUDENT"
                    ? "dumbbell"
                    : role === "PERSONAL"
                      ? "activity"
                      : "utensils"
                }
                size={14}
                className="text-primary/80"
              />
              <FqText
                as="p"
                className="truncate text-base font-semibold text-foreground md:text-lg"
              >
                {title}
              </FqText>
            </div>
            <FqBreadcrumb items={breadcrumbItems} className="hidden md:block" />
          </div>
        </div>

        <div className="fq-raise-hover flex shrink-0 items-center gap-2 rounded-xl border border-border bg-card px-2 py-1.5 md:px-3 md:py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
            {userInitials}
          </div>
          <div className="hidden min-w-0 md:block">
            <FqText
              as="p"
              className="truncate text-sm font-semibold text-foreground"
            >
              {userName}
            </FqText>
            <FqText as="p" className="text-xs text-muted-foreground">
              {role === "STUDENT"
                ? "Aluno"
                : role === "PERSONAL"
                  ? "Personal Trainer"
                  : "Nutricionista"}
            </FqText>
          </div>
          {role === "STUDENT" && studentLevel !== null ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-1 text-xs font-semibold text-success">
              <FqIcon name="star" size={12} />
              Nivel {studentLevel}
            </span>
          ) : null}
        </div>
      </div>
    </header>
  );
}

function TabsRouteFallback() {
  return (
    <section className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        <IonSpinner name="crescent" />
        <FqText>Carregando modulo...</FqText>
      </div>
    </section>
  );
}

function SidebarNav({
  items,
  role,
  onItemClick,
  isCollapsed = false,
}: {
  items: SidebarItem[];
  role: AuthUserRole;
  onItemClick?: () => void;
  isCollapsed?: boolean;
}) {
  const theme = getSidebarTheme(role);

  return (
    <nav className={cx("flex-1 space-y-1 py-4", isCollapsed ? "px-2" : "px-3")}>
      {items.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          exact={item.exact}
          onClick={onItemClick}
          title={isCollapsed ? item.label : undefined}
          aria-label={item.label}
          className={cx(
            "flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
            isCollapsed ? "justify-center" : "justify-between",
            "text-muted-foreground hover:text-foreground",
            theme.hoverItem,
          )}
          activeClassName={theme.activeItem}
        >
          <span
            className={cx("flex items-center", isCollapsed ? "gap-0" : "gap-3")}
          >
            <FqIcon className="h-5 w-5 shrink-0" name={item.icon} />
            {!isCollapsed ? <span>{item.label}</span> : null}
          </span>

          {item.badge && !isCollapsed ? (
            <span className="inline-flex min-h-6 min-w-6 items-center justify-center rounded-full bg-destructive px-1.5 text-xs font-semibold text-destructive-foreground">
              {item.badge}
            </span>
          ) : null}
        </NavLink>
      ))}
    </nav>
  );
}

function DesktopSidebar({
  items,
  role,
  isCollapsed,
  onToggleCollapse,
}: {
  items: SidebarItem[];
  role: AuthUserRole;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const { user, logout } = useAuth();
  const theme = getSidebarTheme(role);

  const firstLetter = (user?.name?.trim().charAt(0) ?? "L").toUpperCase();

  return (
    <aside
      className={cx(
        "hidden h-screen shrink-0 flex-col border-r border-border text-foreground transition-[width] duration-200 lg:flex",
        theme.container,
        isCollapsed ? "w-[84px]" : "w-[280px]",
      )}
    >
      <div
        className={cx(
          "border-b border-border py-4",
          isCollapsed ? "px-2" : "px-6 py-6",
        )}
      >
        <div
          className={cx(
            "flex items-center",
            isCollapsed ? "justify-center" : "gap-3",
          )}
        >
          <div
            className={cx(
              "flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold",
              theme.headerAvatar,
            )}
          >
            {firstLetter}
          </div>
          {!isCollapsed ? (
            <div className="min-w-0 flex-1">
              <FqText
                as="p"
                className="truncate text-sm font-semibold text-sidebar-foreground"
              >
                {user?.name ?? "Usuario"}
              </FqText>
              <FqText as="p" className="mt-0.5 text-xs text-muted-foreground">
                {role === "PERSONAL"
                  ? "Personal Trainer"
                  : role === "NUTRITIONIST"
                    ? "Nutricionista"
                    : "Aluno"}
              </FqText>
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={
            isCollapsed ? "Expandir menu lateral" : "Recolher menu lateral"
          }
          className={cx(
            "mt-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-sidebar-border bg-card text-foreground transition",
            theme.hoverItem,
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            isCollapsed ? "mx-auto" : "",
          )}
        >
          <FqIcon
            name={isCollapsed ? "chevronRight" : "chevronLeft"}
            size={16}
          />
        </button>
      </div>

      <SidebarNav items={items} role={role} isCollapsed={isCollapsed} />

      <div
        className={cx("border-t border-border p-3", isCollapsed ? "px-2" : "")}
      >
        <FqButton
          variant="ghost"
          tone="neutral"
          leftIcon="logOut"
          onClick={logout}
          className={cx(
            "w-full",
            isCollapsed ? "justify-center px-0" : "justify-start",
          )}
          aria-label="Sair da conta"
          title={isCollapsed ? "Sair" : undefined}
        >
          {!isCollapsed ? "Sair" : ""}
        </FqButton>
      </div>
    </aside>
  );
}

function MobileSidebar({
  items,
  role,
  unreadCount,
  isOpen,
  onClose,
  onOpenNotifications,
}: {
  items: SidebarItem[];
  role: AuthUserRole;
  unreadCount: number;
  isOpen: boolean;
  onClose: () => void;
  onOpenNotifications: () => void;
}) {
  if (role === "STUDENT") {
    return null;
  }

  const { logout } = useAuth();
  const theme = getSidebarTheme(role);

  return (
    <>
      <button
        type="button"
        aria-label="Fechar menu"
        onClick={onClose}
        className={cx(
          "fixed inset-0 z-40 bg-foreground/25 transition-opacity lg:hidden",
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
      />

      <aside
        className={cx(
          "fixed bottom-0 left-0 top-0 z-50 flex w-[88vw] max-w-[360px] flex-col overflow-y-auto overscroll-contain border-r border-border text-foreground shadow-2xl transition-transform duration-300 ease-out lg:hidden",
          theme.mobileTop,
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-5">
          <div className="min-w-0">
            <FqText
              as="p"
              className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              {role === "PERSONAL" ? "Area Personal" : "Area Nutricionista"}
            </FqText>
            <FqText as="p" className="text-sm font-semibold text-foreground">
              Navegacao profissional
            </FqText>
          </div>
          <div
            className={cx(
              "flex h-11 w-11 items-center justify-center rounded-xl",
              theme.headerAvatar,
            )}
          >
            <FqIcon
              name={
                role === "PERSONAL"
                  ? "dumbbell"
                  : role === "NUTRITIONIST"
                    ? "utensils"
                    : "home"
              }
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <button
            type="button"
            className="relative text-sidebar-foreground"
            aria-label="Notificacoes"
            onClick={onOpenNotifications}
          >
            <FqIcon name="bell" />
            <span className="absolute -right-2 -top-2 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-xs font-semibold text-destructive-foreground">
              {unreadCount}
            </span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-sidebar-border bg-card text-foreground"
            aria-label="Fechar menu"
          >
            <FqIcon name="x" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scroll-smooth">
          <SidebarNav items={items} role={role} onItemClick={onClose} />
        </div>

        <div className="border-t border-border p-3">
          <FqButton
            variant="ghost"
            tone="neutral"
            leftIcon="logOut"
            onClick={logout}
            className="w-full justify-start"
          >
            Sair
          </FqButton>
        </div>
      </aside>
    </>
  );
}

function MobileBottomNav({
  items,
  role,
}: {
  items: SidebarItem[];
  role: AuthUserRole;
}) {
  if (role !== "STUDENT") {
    return null;
  }

  const theme = getSidebarTheme(role);
  const bottomItems = items.filter((item) => item.showInBottomNav !== false);

  return (
    <nav
      className={cx(
        "fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background/95 backdrop-blur safe-bottom lg:hidden",
        theme.mobileTop,
      )}
    >
      <div className="scrollbar-hide flex items-stretch gap-1 overflow-x-auto px-2 py-2 scroll-smooth">
        {bottomItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            exact={item.exact}
            className="relative flex min-h-12 min-w-[78px] flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium text-muted-foreground transition"
            activeClassName={cx("text-foreground", theme.activeItem)}
          >
            <FqIcon name={item.icon} size={16} />
            <span className="truncate">{item.label}</span>
            {item.badge ? (
              <span className="absolute right-2 top-1 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
                {item.badge}
              </span>
            ) : null}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export function AppTabsLayout() {
  const history = useHistory();
  const location = useLocation();
  const { role } = useRole();
  const { user } = useAuth();
  const { inbox } = useNotificationsInbox();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(
    () => {
      if (typeof window === "undefined") {
        return false;
      }

      return window.localStorage.getItem("fitquest:sidebar-collapsed") === "1";
    },
  );

  function handleToggleDesktopSidebar() {
    setIsDesktopSidebarCollapsed((currentValue) => {
      const nextValue = !currentValue;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          "fitquest:sidebar-collapsed",
          nextValue ? "1" : "0",
        );
      }
      return nextValue;
    });
  }

  const unreadCount = inbox?.unreadCount ?? 0;
  const sidebarItems = useMemo(
    () => getRoleMenu(role, unreadCount),
    [role, unreadCount],
  );
  const routeMeta = useMemo(
    () => getRouteMeta(location.pathname),
    [location.pathname],
  );

  const levelQuery = useQuery({
    queryKey: ["layout", "student-level"],
    queryFn: () => gamificationService.getOverview(),
    enabled: role === "STUDENT",
    staleTime: 15_000,
    refetchOnWindowFocus: true,
  });

  const userName = user?.name?.trim() || "Usuario";
  const userInitials =
    userName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "U";
  const studentLevel =
    role === "STUDENT" ? (levelQuery.data?.level ?? null) : null;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DesktopSidebar
        items={sidebarItems}
        role={role}
        isCollapsed={isDesktopSidebarCollapsed}
        onToggleCollapse={handleToggleDesktopSidebar}
      />
      <MobileSidebar
        items={sidebarItems}
        role={role}
        unreadCount={unreadCount}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        onOpenNotifications={() => {
          setIsMobileSidebarOpen(false);
          history.push("/tabs/notifications");
        }}
      />

      <main className="fq-smooth-scroll min-w-0 flex-1 overflow-y-auto ">
        <div className="block sm:hidden">
          <TopHeader
            title={routeMeta.title}
            parent={routeMeta.parent}
            role={role}
            userName={userName}
            userInitials={userInitials}
            studentLevel={studentLevel}
            canOpenMenu={role !== "STUDENT"}
            onOpenMenu={() => {
              if (role !== "STUDENT") {
                setIsMobileSidebarOpen(true);
              }
            }}
            onNavigate={(path) => history.push(path)}
          />
        </div>

        <div className="mx-auto w-full max-w-7xl px-4 pb-28 pt-4 md:px-6 md:pb-32 md:pt-5 lg:px-8 lg:pb-6 lg:pt-6">
          <Switch>
            <Route
              path="/tabs/workouts"
              exact
              render={() => (
                <RoleGuard
                  allowedRoles={["STUDENT"]}
                  fallbackTo={getDefaultTabsPathByRole(role)}
                >
                  <Suspense fallback={<TabsRouteFallback />}>
                    <TrainingPlanPage />
                  </Suspense>
                </RoleGuard>
              )}
            />
            <Route
              path="/tabs/workouts/session"
              exact
              render={() => (
                <RoleGuard
                  allowedRoles={["STUDENT"]}
                  fallbackTo={getDefaultTabsPathByRole(role)}
                >
                  <Suspense fallback={<TabsRouteFallback />}>
                    <TrainingSessionPage />
                  </Suspense>
                </RoleGuard>
              )}
            />
            <Route
              path="/tabs/run"
              exact
              render={() => (
                <RoleGuard
                  allowedRoles={["STUDENT"]}
                  fallbackTo={getDefaultTabsPathByRole(role)}
                >
                  <Suspense fallback={<TabsRouteFallback />}>
                    <RunTabLazy />
                  </Suspense>
                </RoleGuard>
              )}
            />
            <Route
              path="/tabs/nutrition/meal/:mealId"
              exact
              render={() => (
                <RoleGuard
                  allowedRoles={["STUDENT"]}
                  fallbackTo={getDefaultTabsPathByRole(role)}
                >
                  <Suspense fallback={<TabsRouteFallback />}>
                    <NutritionPage />
                  </Suspense>
                </RoleGuard>
              )}
            />
            <Route
              path="/tabs/nutrition/history"
              exact
              render={() => (
                <RoleGuard
                  allowedRoles={["STUDENT"]}
                  fallbackTo={getDefaultTabsPathByRole(role)}
                >
                  <Suspense fallback={<TabsRouteFallback />}>
                    <NutritionPage />
                  </Suspense>
                </RoleGuard>
              )}
            />
            <Route
              path="/tabs/nutrition"
              exact
              render={() => (
                <RoleGuard
                  allowedRoles={["STUDENT"]}
                  fallbackTo={getDefaultTabsPathByRole(role)}
                >
                  <Suspense fallback={<TabsRouteFallback />}>
                    <NutritionPage />
                  </Suspense>
                </RoleGuard>
              )}
            />
            <Route
              path="/tabs/progress"
              exact
              render={() => (
                <Suspense fallback={<TabsRouteFallback />}>
                  <ProgressTabLazy />
                </Suspense>
              )}
            />
            <Route
              path="/tabs/gamification"
              exact
              render={() => (
                <RoleGuard
                  allowedRoles={["STUDENT"]}
                  fallbackTo={getDefaultTabsPathByRole(role)}
                >
                  <Suspense fallback={<TabsRouteFallback />}>
                    <GamificationTabLazy />
                  </Suspense>
                </RoleGuard>
              )}
            />
            <Route
              path="/tabs/ranking"
              exact
              render={() => (
                <Suspense fallback={<TabsRouteFallback />}>
                  <RankingTabLazy />
                </Suspense>
              )}
            />
            <Route
              path="/tabs/notifications"
              exact
              render={() => (
                <Suspense fallback={<TabsRouteFallback />}>
                  <NotificationsTabLazy />
                </Suspense>
              )}
            />
            <Route
              path="/tabs/home"
              exact
              render={() => (
                <RoleGuard
                  allowedRoles={["STUDENT"]}
                  fallbackTo={getDefaultTabsPathByRole(role)}
                >
                  <HomePage />
                </RoleGuard>
              )}
            />
            <Route
              path="/tabs/personal/:section?/:workoutId?"
              render={() => (
                <RoleGuard
                  allowedRoles={["PERSONAL"]}
                  fallbackTo={getDefaultTabsPathByRole(role)}
                >
                  <PersonalDashboardPage />
                </RoleGuard>
              )}
            />
            <Route
              path="/tabs/nutritionist/:section?"
              render={() => (
                <RoleGuard
                  allowedRoles={["NUTRITIONIST"]}
                  fallbackTo={getDefaultTabsPathByRole(role)}
                >
                  <NutritionistDashboardPage />
                </RoleGuard>
              )}
            />
            <Route path="/tabs/profile" component={ProfilePage} exact />
            <Route exact path="/tabs">
              <Redirect to={getDefaultTabsPathByRole(role)} />
            </Route>
            <Route>
              <Redirect to={getDefaultTabsPathByRole(role)} />
            </Route>
          </Switch>
        </div>
      </main>

      <MobileBottomNav items={sidebarItems} role={role} />
    </div>
  );
}
