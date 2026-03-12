import { useMemo, useState } from "react";

import { IonSpinner } from "@ionic/react";
import { useQuery } from "@tanstack/react-query";
import {
  NavLink,
  Redirect,
  Route,
  Switch,
  useHistory,
  useLocation,
} from "react-router-dom";

import { getDefaultTabsPathByRole } from "@/app/router/guards/Guards";
import {
  renderNutritionistRoutes,
  renderPersonalRoutes,
  renderStudentRoutes,
} from "@/app/router/routes";
import { nutritionistNavigationItems } from "@/features/nutritionist/presentation";
import { personalNavigationItems } from "@/features/personal/presentation";
import { useNotificationsInbox } from "@/features/student/application";
import { StudentProfilePage } from "@/features/student/presentation/pages/StudentProfilePage";
import {
  getStudentNavigationItem,
  studentNavigationItems,
} from "@/features/student/presentation";
import { gamificationService } from "@/services";
import { useAuth, useRole } from "@/shared/hooks";
import { FqBreadcrumb, FqButton, FqIcon, FqText } from "@/shared/ui";
import type { IconName } from "@/shared/ui";
import { cx } from "@/shared";
import type { AuthUserRole } from "@/shared/types";

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
      container: "bg-sidebar/85",
      headerAvatar: "bg-secondary/15 text-secondary",
      hoverItem: "hover:bg-secondary/10 hover:text-foreground",
      activeItem:
        "border border-secondary/18 bg-secondary/10 text-foreground shadow-[0_12px_26px_rgba(120,146,174,0.12)]",
      mobileTop: "bg-sidebar/95",
    };
  }

  if (role === "NUTRITIONIST") {
    return {
      container: "bg-sidebar/85",
      headerAvatar: "bg-tertiary/15 text-tertiary",
      hoverItem: "hover:bg-tertiary/10 hover:text-foreground",
      activeItem:
        "border border-tertiary/20 bg-tertiary/12 text-foreground shadow-[0_12px_26px_rgba(210,173,132,0.12)]",
      mobileTop: "bg-sidebar/95",
    };
  }

  return {
    container: "bg-sidebar/85",
    headerAvatar: "bg-primary/15 text-primary",
    hoverItem: "hover:bg-primary/10 hover:text-foreground",
    activeItem:
      "border border-primary/18 bg-primary/10 text-foreground shadow-[0_12px_26px_rgba(95,141,118,0.12)]",
    mobileTop: "bg-sidebar/95",
  };
}

function getRoleLabel(role: AuthUserRole) {
  if (role === "PERSONAL") {
    return "Personal Trainer";
  }

  if (role === "NUTRITIONIST") {
    return "Nutricionista";
  }

  return "Aluno";
}

function getRoleIcon(role: AuthUserRole): IconName {
  if (role === "PERSONAL") {
    return "activity";
  }

  if (role === "NUTRITIONIST") {
    return "utensils";
  }

  return "dumbbell";
}

function getRoleMenu(role: AuthUserRole, unreadCount: number): SidebarItem[] {
  if (role === "PERSONAL") {
    return personalNavigationItems.map((item) => ({
      label: item.label,
      icon: item.icon,
      path: item.path,
      exact: item.exact,
      roles: ["PERSONAL"],
    }));
  }

  if (role === "NUTRITIONIST") {
    return nutritionistNavigationItems.map((item) => ({
      label: item.label,
      icon: item.icon,
      path: item.path,
      exact: item.exact,
      roles: ["NUTRITIONIST"],
    }));
  }

  return studentNavigationItems.map((item) => ({
    label: item.label,
    icon: item.icon,
    path: item.path,
    exact: item.exact,
    badge:
      item.key === "notifications" && unreadCount > 0 ? unreadCount : undefined,
    roles: ["STUDENT"],
    showInBottomNav: item.mobileDock,
  }));
}

function getRouteMeta(pathname: string): LayoutRouteMeta {
  if (pathname.startsWith("/tabs/nutrition/meal/")) {
    return { title: "Detalhe da refeicao", parent: "Nutricao" };
  }

  if (pathname === "/tabs/nutrition/history") {
    return { title: "Historico", parent: "Nutricao" };
  }

  if (pathname.startsWith("/tabs/workouts/completed/")) {
    return { title: "Treino concluido", parent: "Treinos" };
  }

  if (
    pathname.startsWith("/tabs/workouts/") &&
    pathname !== "/tabs/workouts/session"
  ) {
    return { title: "Detalhe do treino", parent: "Treinos" };
  }

  if (pathname.startsWith("/tabs/run/completed/")) {
    return { title: "Resumo do cardio", parent: "Corrida" };
  }

  if (pathname === "/tabs/run/session") {
    return { title: "Atividade em andamento", parent: "Corrida" };
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

  const studentNavItem = getStudentNavigationItem(pathname);

  if (studentNavItem) {
    return {
      title: studentNavItem.label,
    };
  }

  const labelMap: Record<string, string> = {
    "/tabs/student": "Hub do aluno",
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
    <header className="safe-top sticky top-0 z-30 px-4 pt-3 md:px-6 lg:px-8">
      <div className="fq-shell-panel fq-fitness-glow mx-auto flex w-full items-start justify-between gap-3 px-4 py-3 md:px-5 md:py-4">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          {canOpenMenu ? (
            <button
              type="button"
              aria-label="Abrir menu"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border/80 bg-background/80 text-foreground shadow-[0_8px_20px_rgba(36,49,44,0.05)] lg:hidden"
              onClick={onOpenMenu}
            >
              <FqIcon name="menu" />
            </button>
          ) : (
            <div className="h-11 w-11 shrink-0 lg:hidden" />
          )}
          <div className="min-w-0 space-y-1">
            <div className="inline-flex items-center gap-2.5">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <FqIcon
                  name={getRoleIcon(role)}
                  size={14}
                  className="text-primary"
                />
              </span>
              <span className="fq-subtle-label hidden sm:inline">FitQuest</span>
              <FqText
                as="p"
                className="truncate text-base font-semibold text-foreground md:text-lg"
              >
                {title}
              </FqText>
            </div>
            <div className="space-y-1">
              <FqBreadcrumb
                items={breadcrumbItems}
                className="hidden md:block"
              />
              <FqText
                as="p"
                className="text-xs text-muted-foreground md:hidden"
              >
                {parent ? `${parent} / ${title}` : getRoleLabel(role)}
              </FqText>
            </div>
          </div>
        </div>

        <div className="fq-raise-hover flex shrink-0 items-center gap-2 rounded-[calc(var(--radius)+2px)] border border-border/75 bg-background/70 px-2.5 py-2 md:px-3.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/15 text-sm font-semibold text-primary">
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
              {getRoleLabel(role)}
            </FqText>
          </div>
          {role === "STUDENT" && studentLevel !== null ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-success/15 bg-success/10 px-2 py-1 text-xs font-semibold text-success">
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
    <section className="fq-shell-panel p-6">
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
    <nav
      className={cx("flex-1 space-y-1.5 py-4", isCollapsed ? "px-2" : "px-3.5")}
    >
      {items.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          exact={item.exact}
          onClick={onItemClick}
          title={isCollapsed ? item.label : undefined}
          aria-label={item.label}
          className={cx(
            "flex items-center rounded-[calc(var(--radius)+2px)] border border-transparent px-3 py-3 text-sm font-medium transition",
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
        "hidden h-screen shrink-0 p-4 transition-[width] duration-200 lg:flex",
        isCollapsed ? "w-[108px]" : "w-[312px]",
      )}
    >
      <div
        className={cx(
          "fq-shell-panel flex h-full min-h-0 flex-1 flex-col overflow-hidden",
          theme.container,
        )}
      >
        <div
          className={cx(
            "border-b border-border/70",
            isCollapsed ? "px-3 py-4" : "px-5 py-5",
          )}
        >
          <div
            className={cx(
              "flex items-center",
              isCollapsed ? "justify-center" : "gap-3",
            )}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-[calc(var(--radius)+4px)] bg-foreground text-sm font-semibold text-background">
              <FqIcon name="star" size={18} />
            </div>
            {!isCollapsed ? (
              <div className="min-w-0 flex-1">
                <FqText as="p" className="fq-subtle-label">
                  FitQuest
                </FqText>
                <FqText
                  as="p"
                  className="truncate text-sm font-semibold text-sidebar-foreground"
                >
                  Rotina fitness sem ruido
                </FqText>
              </div>
            ) : null}
          </div>

          <div
            className={cx(
              "mt-4 flex items-center rounded-[calc(var(--radius)+2px)] border border-border/70 bg-background/70",
              isCollapsed ? "justify-center px-0 py-3" : "gap-3 px-3 py-3",
            )}
          >
            <div
              className={cx(
                "flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-semibold",
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
                  {getRoleLabel(role)}
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
              "mt-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-sidebar-border bg-background/70 text-foreground transition",
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
          className={cx(
            "border-t border-border/70 p-3",
            isCollapsed ? "px-2" : "px-3.5 pb-4",
          )}
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
          "fixed bottom-0 left-0 top-0 z-50 flex w-[88vw] max-w-[360px] flex-col overflow-y-auto overscroll-contain border-r border-border/70 text-foreground shadow-2xl transition-transform duration-300 ease-out lg:hidden",
          theme.mobileTop,
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-border/70 px-5 py-5">
          <div className="min-w-0">
            <FqText as="p" className="fq-subtle-label">
              FitQuest
            </FqText>
            <FqText as="p" className="text-sm font-semibold text-foreground">
              Navegacao profissional
            </FqText>
          </div>
          <div
            className={cx(
              "flex h-11 w-11 items-center justify-center rounded-2xl",
              theme.headerAvatar,
            )}
          >
            <FqIcon name={getRoleIcon(role)} />
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
          <button
            type="button"
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-background/70 text-sidebar-foreground"
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
            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-sidebar-border bg-background/70 text-foreground"
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
    <nav className="fixed inset-x-0 bottom-0 z-30 px-4 pb-4 safe-bottom lg:hidden">
      <div
        className={cx(
          "mx-auto max-w-md rounded-[30px] border border-border/80 bg-card/92 p-2 shadow-[0_18px_40px_rgba(36,49,44,0.12)] backdrop-blur",
          theme.mobileTop,
        )}
      >
        <div className="scrollbar-hide grid grid-cols-5 gap-1 overflow-x-auto scroll-smooth">
          {bottomItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              exact={item.exact}
              className="relative flex min-h-[68px] min-w-0 flex-col items-center justify-center gap-1 rounded-[24px] px-2 py-2 text-[11px] font-medium text-muted-foreground transition"
              activeClassName={cx("text-foreground", theme.activeItem)}
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-background/70">
                <FqIcon name={item.icon} size={16} />
              </span>
              <span className="truncate">{item.label}</span>
              {item.badge ? (
                <span className="absolute right-2 top-1 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
                  {item.badge}
                </span>
              ) : null}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}

export function AppTabsLayout({
  roleOverride,
}: {
  roleOverride?: AuthUserRole;
}) {
  const history = useHistory();
  const location = useLocation();
  const { role: authenticatedRole } = useRole();
  const { user } = useAuth();
  const { inbox } = useNotificationsInbox();
  const role = roleOverride ?? authenticatedRole;
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

      <main className="fq-smooth-scroll min-w-0 flex-1 overflow-y-auto">
        <div className={cx(role === "STUDENT" ? "block sm:hidden" : "block")}>
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

        <div className="mx-auto w-full max-w-7xl px-4 pb-28 pt-4 md:px-6 md:pb-32 md:pt-5 lg:px-8 lg:pb-8 lg:pt-6">

          <Switch>
            {renderStudentRoutes({ role, fallback: <TabsRouteFallback /> })}
            {renderPersonalRoutes(role)}
            {renderNutritionistRoutes(role)}
            <Route
              path="/tabs/profile"
              exact
              render={() => <StudentProfilePage />}
            />
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
