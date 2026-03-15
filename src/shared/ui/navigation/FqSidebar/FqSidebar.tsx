import { useMemo, useState } from "react";

import { FqIcon } from "@/shared/ui";
import { useAuth } from "@/shared/hooks";
import { cx } from "@/shared/utils";

import type { FqSidebarProps } from "./fq-sidebar.types";
import { FqSidebarUserCard } from "./FqSidebarUserCard";
import { FqSidebarSearch } from "./FqSidebarSearch";
import { FqSidebarSection } from "./FqSidebarSection";
// import { FqSidebarFooterCard } from "./FqSidebarFooterCard";

import "./fq-sidebar.scss";

export function FqSidebar({
  config,
  pathname,
  onNavigate,
  isCollapsed = false,
  onToggleCollapse,
  className,
}: FqSidebarProps) {
  const { logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return config.sections;

    const q = searchQuery.toLowerCase().trim();
    return config.sections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => {
          if (item.label.toLowerCase().includes(q)) return true;
          return item.children?.some((child) =>
            child.label.toLowerCase().includes(q),
          );
        }),
      }))
      .filter((section) => section.items.length > 0);
  }, [config.sections, searchQuery]);

  return (
    <aside
      className={cx(
        "fq-sidebar",
        isCollapsed ? "fq-sidebar--collapsed" : "fq-sidebar--expanded",
        className,
      )}
      aria-label="Navegacao principal"
    >
      <div className="fq-sidebar__container">
        {/* ── Header: brand + user card + search ── */}
        <div className="fq-sidebar__header">
          {/* Brand */}
          <div className="fq-sidebar__brand">
            <div className="fq-sidebar__brand-icon">
              <FqIcon name="star" size={18} />
            </div>
            <div className="fq-sidebar__brand-text">
              <p className="fq-sidebar__brand-name">FitQuest</p>
              <p className="fq-sidebar__brand-tagline">
                Rotina fitness sem ruido
              </p>
            </div>
          </div>

          {/* User card */}
          <FqSidebarUserCard config={config} />

          {/* Search */}
          <FqSidebarSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Buscar pagina ou funcao..."
          />
        </div>

        {/* ── Scrollable nav sections ── */}
        <nav className="fq-sidebar__nav" aria-label="Menu principal">
          {filteredSections.map((section) => (
            <FqSidebarSection
              key={section.id}
              section={section}
              pathname={pathname}
              onNavigate={onNavigate}
            />
          ))}

          {filteredSections.length === 0 ? (
            <p
              className="fq-sidebar-section__title"
              style={{ marginTop: 20 }}
            >
              Nenhum resultado encontrado
            </p>
          ) : null}
        </nav>

        {/* ── Footer card ── */}
        {/* <FqSidebarFooterCard card={config.footerCard} onNavigate={onNavigate} /> */}

        {/* ── Footer actions ── */}
        <div className="fq-sidebar__footer">
          <button
            type="button"
            className="fq-sidebar__footer-btn"
            aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
            title={isCollapsed ? "Expandir" : "Recolher"}
            onClick={() => onToggleCollapse?.()}
          >
            <span className="fq-sidebar__footer-btn-icon">
              <FqIcon
                name={isCollapsed ? "chevronRight" : "chevronLeft"}
                size={18}
                strokeWidth={1.8}
              />
            </span>
            <span className="fq-sidebar__footer-btn-label">
              {isCollapsed ? "Expandir" : "Recolher"}
            </span>
          </button>

          <button
            type="button"
            className="fq-sidebar__footer-btn"
            aria-label="Sair da conta"
            title="Sair"
            onClick={() => void logout()}
          >
            <span className="fq-sidebar__footer-btn-icon">
              <FqIcon name="logOut" size={18} strokeWidth={1.8} />
            </span>
            <span className="fq-sidebar__footer-btn-label">Sair</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
