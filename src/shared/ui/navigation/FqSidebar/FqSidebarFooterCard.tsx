import { FqIcon } from "@/shared/ui";

import type { FqSidebarFooterCardDef } from "./fq-sidebar.types";

type FqSidebarFooterCardProps = {
  card: FqSidebarFooterCardDef;
  onNavigate: (path: string) => void;
};

export function FqSidebarFooterCard({
  card,
  onNavigate,
}: FqSidebarFooterCardProps) {
  return (
    <div className="fq-sidebar-footer-card">
      <div className="fq-sidebar-footer-card__header">
        {card.icon ? (
          <div className="fq-sidebar-footer-card__icon">
            <FqIcon name={card.icon} size={16} strokeWidth={1.8} />
          </div>
        ) : null}
        <span className="fq-sidebar-footer-card__title">{card.title}</span>
      </div>
      <p className="fq-sidebar-footer-card__description">{card.description}</p>
      {card.actionLabel && card.actionPath ? (
        <button
          type="button"
          className="fq-sidebar-footer-card__action"
          onClick={() => onNavigate(card.actionPath!)}
        >
          {card.actionLabel}
          <FqIcon name="chevronRight" size={13} strokeWidth={2} />
        </button>
      ) : null}
    </div>
  );
}
