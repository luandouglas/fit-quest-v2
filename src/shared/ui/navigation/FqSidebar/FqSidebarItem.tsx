import { useState, useEffect } from "react";

import { FqIcon } from "@/shared/ui";
import { cx } from "@/shared/utils";

import type { FqSidebarItemDef } from "./fq-sidebar.types";

function isItemActive(
  item: FqSidebarItemDef,
  pathname: string,
): boolean {
  if (item.matcher) return item.matcher(pathname);
  if (item.exact) return pathname === item.path;
  if (item.path) return pathname === item.path || pathname.startsWith(`${item.path}/`);
  return false;
}

function isItemOrChildActive(
  item: FqSidebarItemDef,
  pathname: string,
): boolean {
  if (isItemActive(item, pathname)) return true;
  return item.children?.some((child) => isItemActive(child, pathname)) ?? false;
}

// ─── Single nav item ───────────────────────────────────────────────

type FqSidebarItemProps = {
  item: FqSidebarItemDef;
  pathname: string;
  onNavigate: (path: string) => void;
};

export function FqSidebarItem({
  item,
  pathname,
  onNavigate,
}: FqSidebarItemProps) {
  const hasChildren = item.children && item.children.length > 0;
  const active = isItemActive(item, pathname);
  const childActive = hasChildren && isItemOrChildActive(item, pathname);

  const [isExpanded, setIsExpanded] = useState(childActive);

  // Auto-expand if child becomes active via route change
  useEffect(() => {
    if (childActive && !isExpanded) {
      setIsExpanded(true);
    }
  }, [childActive]);

  function handleClick() {
    if (hasChildren) {
      setIsExpanded((v) => !v);
    } else if (item.path) {
      onNavigate(item.path);
    }
  }

  return (
    <div>
      <button
        type="button"
        className={cx(
          "fq-sidebar-item",
          (active || (childActive && !hasChildren)) && "is-active",
        )}
        aria-current={active ? "page" : undefined}
        aria-expanded={hasChildren ? isExpanded : undefined}
        onClick={handleClick}
      >
        <span className="fq-sidebar-item__icon">
          <FqIcon name={item.icon} size={18} strokeWidth={1.8} />
        </span>
        <span className="fq-sidebar-item__label">{item.label}</span>
        {item.badge !== undefined ? (
          <span className="fq-sidebar-item__badge">{item.badge}</span>
        ) : null}
        {hasChildren ? (
          <span
            className={cx(
              "fq-sidebar-item__chevron",
              isExpanded && "is-open",
            )}
          >
            <FqIcon name="chevronRight" size={14} strokeWidth={2} />
          </span>
        ) : null}
      </button>

      {hasChildren ? (
        <div
          className={cx(
            "fq-sidebar-submenu",
            isExpanded ? "is-expanded" : "is-collapsed",
          )}
        >
          <div className="fq-sidebar-submenu__inner">
            {item.children!.map((child) => {
              const childIsActive = isItemActive(child, pathname);
              return (
                <button
                  key={child.id}
                  type="button"
                  className={cx(
                    "fq-sidebar-submenu__item",
                    childIsActive && "is-active",
                  )}
                  aria-current={childIsActive ? "page" : undefined}
                  onClick={() => child.path && onNavigate(child.path)}
                >
                  <span className="fq-sidebar-item__icon">
                    <FqIcon name={child.icon} size={16} strokeWidth={1.8} />
                  </span>
                  <span className="fq-sidebar-item__label">{child.label}</span>
                  {child.badge !== undefined ? (
                    <span className="fq-sidebar-item__badge">{child.badge}</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
