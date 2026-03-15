import { useMemo, useState } from "react";

import { IonSpinner } from "@ionic/react";
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
import { studentNavigationItems } from "@/features/student/presentation";
import { FitQuestTabBar } from "@/components/navigation/FitQuestTabBar";
import {
  fitQuestStudentQuickActions,
  fitQuestStudentTabItems,
} from "@/components/navigation/fitquest-tab-bar.config";
import { useAuth, useRole } from "@/shared/hooks";
import { FqButton, FqIcon, FqText } from "@/shared/ui";
import { FqSidebar, getSidebarConfig } from "@/shared/ui";
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
  matcher?: (pathname: string) => boolean;
};

type SidebarTheme = {
  container: string;
  headerAvatar: string;
  hoverItem: string;
  activeItem: string;
  mobileTop: string;
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
    matcher: item.matches,
  }));
}

function isSidebarItemActive(item: SidebarItem, pathname: string) {
  if (item.matcher) {
    return item.matcher(pathname);
  }

  if (item.exact) {
    return pathname === item.path;
  }

  return pathname === item.path || pathname.startsWith(`${item.path}/`);
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
          isActive={(_, location) =>
            location ? isSidebarItemActive(item, location.pathname) : false
          }
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
  const { logout } = useAuth();

  if (role === "STUDENT") {
    return null;
  }

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
  pathname,
  onNavigate,
  role,
}: {
  pathname: string;
  onNavigate: (path: string) => void;
  role: AuthUserRole;
}) {
  if (role !== "STUDENT") {
    return null;
  }

  return (
    <FitQuestTabBar
      tabs={fitQuestStudentTabItems}
      quickActions={fitQuestStudentQuickActions}
      pathname={pathname}
      onNavigate={onNavigate}
    />
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
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <FqSidebar
        config={getSidebarConfig(role)}
        pathname={location.pathname}
        onNavigate={(path) => history.push(path)}
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
        <div
          className={cx(
            "mx-auto w-full max-w-7xl px-4 pt-4 md:px-6 md:pt-5 lg:px-8 lg:pt-6",
            role === "STUDENT"
              ? "pb-[calc(env(safe-area-inset-bottom,0px)+9rem)] md:pb-32 lg:pb-8"
              : "pb-28 md:pb-32 lg:pb-8",
          )}
        >
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

      <MobileBottomNav
        pathname={location.pathname}
        onNavigate={(path) => history.push(path)}
        role={role}
      />
    </div>
  );
}
