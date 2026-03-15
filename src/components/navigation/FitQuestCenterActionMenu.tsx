import type { CSSProperties } from "react";

import { FqIcon } from "@/shared/ui";
import { cx } from "@/shared/utils";

import type { FitQuestQuickActionItem } from "./fitquest-tab-bar.config";

const radialActionAngles = [-150, -90, -30];
const radialDistancePx = 118;

type FitQuestCenterActionMenuProps = {
  actions: FitQuestQuickActionItem[];
  isOpen: boolean;
  menuId: string;
  onAction: (action: FitQuestQuickActionItem) => void;
};

export function FitQuestCenterActionMenu({
  actions,
  isOpen,
  menuId,
  onAction,
}: FitQuestCenterActionMenuProps) {
  return (
    <div
      id={menuId}
      className="fitquest-center-menu"
      data-open={isOpen}
      role="menu"
      aria-label="Acoes rapidas do aluno"
      aria-hidden={!isOpen}
    >
      {actions.map((action, index) => {
        const angle = radialActionAngles[index] ?? -90;
        const angleInRadians = (angle * Math.PI) / 180;
        const style = {
          "--fq-action-x": `${Math.round(
            Math.cos(angleInRadians) * radialDistancePx,
          )}px`,
          "--fq-action-y": `${Math.round(
            Math.sin(angleInRadians) * radialDistancePx,
          )}px`,
          "--fq-action-delay": `${index * 28}ms`,
        } as CSSProperties;

        return (
          <div
            key={action.key}
            className="fitquest-center-menu__action"
            style={style}
          >
            <button
              type="button"
              role="menuitem"
              className={cx(
                "fitquest-center-menu__button",
                isOpen && "is-open",
              )}
              tabIndex={isOpen ? 0 : -1}
              aria-label={action.label}
              onClick={() => onAction(action)}
            >
              <span className="fitquest-center-menu__button-icon">
                <FqIcon name={action.icon} size={18} strokeWidth={1.9} />
              </span>
              <span className="fitquest-center-menu__button-label">
                {action.caption}
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
