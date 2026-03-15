import type { IconName } from "@/shared/ui";
import type { AuthUserRole } from "@/shared/types";

// ─── Navigation item ───────────────────────────────────────────────

export type FqSidebarItemDef = {
  id: string;
  label: string;
  icon: IconName;
  path?: string;
  exact?: boolean;
  badge?: string | number;
  children?: FqSidebarItemDef[];
  matcher?: (pathname: string) => boolean;
};

// ─── Grouping ──────────────────────────────────────────────────────

export type FqSidebarSectionDef = {
  id: string;
  title: string;
  items: FqSidebarItemDef[];
};

// ─── Rail shortcut ─────────────────────────────────────────────────

export type FqSidebarRailItemDef = {
  id: string;
  icon: IconName;
  label: string;
  path?: string;
  action?: () => void;
  matcher?: (pathname: string) => boolean;
};

// ─── Footer card ───────────────────────────────────────────────────

export type FqSidebarFooterCardDef = {
  title: string;
  description: string;
  icon?: IconName;
  actionLabel?: string;
  actionPath?: string;
};

// ─── Per-role configuration ────────────────────────────────────────

export type FqSidebarRoleConfig = {
  role: AuthUserRole;
  roleLabel: string;
  roleIcon: IconName;
  railItems: FqSidebarRailItemDef[];
  sections: FqSidebarSectionDef[];
  footerCard: FqSidebarFooterCardDef;
};

// ─── Component props ───────────────────────────────────────────────

export type FqSidebarProps = {
  config: FqSidebarRoleConfig;
  pathname: string;
  onNavigate: (path: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
};
