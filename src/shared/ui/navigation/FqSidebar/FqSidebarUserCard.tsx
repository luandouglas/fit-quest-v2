import { FqAvatar } from "@/shared/ui";
import { useAuth } from "@/shared/hooks";

import type { FqSidebarRoleConfig } from "./fq-sidebar.types";

type FqSidebarUserCardProps = {
  config: FqSidebarRoleConfig;
};

export function FqSidebarUserCard({ config }: FqSidebarUserCardProps) {
  const { user } = useAuth();

  return (
    <div className="fq-sidebar-user-card">
      <FqAvatar name={user?.name ?? "U"} size="sm" />
      <div className="fq-sidebar-user-card__info">
        <p className="fq-sidebar-user-card__name">{user?.name ?? "Usuario"}</p>
        <p className="fq-sidebar-user-card__role">{config.roleLabel}</p>
      </div>
    </div>
  );
}
