import { useEffect, useId, useState } from "react";

import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

import { FqIcon } from "@/shared/ui";
import { cx } from "@/shared/utils";

import { FitQuestCenterActionMenu } from "./FitQuestCenterActionMenu";
import type {
  FitQuestQuickActionItem,
  FitQuestTabBarProfile,
  FitQuestTabItem,
} from "./fitquest-tab-bar.config";

import "./fitquest-tab-bar.scss";

async function triggerFitQuestHaptic(variant: "soft" | "accent") {
  try {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({
        style: variant === "accent" ? ImpactStyle.Medium : ImpactStyle.Light,
      });
      return;
    }

    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(variant === "accent" ? 18 : 10);
    }
  } catch {
    // Haptic feedback is optional and should never block navigation.
  }
}

type FitQuestTabBarProps = {
  tabs: FitQuestTabItem[];
  quickActions: FitQuestQuickActionItem[];
  profile: FitQuestTabBarProfile;
  pathname: string;
  onNavigate: (path: string) => void;
};

export function FitQuestTabBar({
  tabs,
  quickActions,
  profile,
  pathname,
  onNavigate,
}: FitQuestTabBarProps) {
  const [openMenuPathname, setOpenMenuPathname] = useState<string | null>(null);
  const isMenuOpen = openMenuPathname === pathname;
  const menuId = useId();
  const leftTabs = tabs.slice(0, 2);
  const rightTabs = tabs.slice(2, 4);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenMenuPathname(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  function handleNavigate(path: string) {
    setOpenMenuPathname(null);
    void triggerFitQuestHaptic("soft");

    if (pathname !== path) {
      onNavigate(path);
    }
  }

  function handleToggleMenu() {
    setOpenMenuPathname((currentValue) => {
      const nextValue = currentValue !== pathname;
      void triggerFitQuestHaptic(nextValue ? "accent" : "soft");
      return nextValue ? pathname : null;
    });
  }

  function handleCloseMenu() {
    setOpenMenuPathname(null);
  }

  function handleQuickAction(action: FitQuestQuickActionItem) {
    setOpenMenuPathname(null);
    void triggerFitQuestHaptic("accent");
    onNavigate(action.path);
  }

  function renderTab(item: FitQuestTabItem) {
    const isActive = item.matches(pathname);

    return (
      <button
        key={item.key}
        type="button"
        className={cx("fitquest-tab-bar__tab", isActive && "is-active")}
        aria-label={item.label}
        aria-current={isActive ? "page" : undefined}
        onClick={() => handleNavigate(item.path)}
      >
        <span className="fitquest-tab-bar__tab-orb">
          <FqIcon name={item.icon} size={20} strokeWidth={1.9} />
        </span>
        <span className="fitquest-tab-bar__tab-label">{item.label}</span>
        {item.badge !== undefined ? (
          <span className="fitquest-tab-bar__badge">{item.badge}</span>
        ) : null}
      </button>
    );
  }

  return (
    <div
      className="fitquest-tab-bar-layer"
      data-open={isMenuOpen}
      data-role={profile.role}
    >
      <button
        type="button"
        className="fitquest-tab-bar__overlay"
        aria-label={profile.closeMenuLabel}
        aria-hidden={!isMenuOpen}
        tabIndex={isMenuOpen ? 0 : -1}
        onClick={handleCloseMenu}
      />

      <nav
        className="fitquest-tab-bar__nav"
        aria-label={profile.navLabel}
      >
        <div className="fitquest-tab-bar__shell">
          <div className="fitquest-tab-bar__cluster fitquest-tab-bar__cluster--left">
            {leftTabs.map(renderTab)}
          </div>

          <div className="fitquest-tab-bar__center-slot">
            <FitQuestCenterActionMenu
              actions={quickActions}
              isOpen={isMenuOpen}
              menuId={menuId}
              ariaLabel={profile.quickMenuLabel}
              onAction={handleQuickAction}
            />

            <button
              type="button"
              className={cx(
                "fitquest-tab-bar__center-button",
                isMenuOpen && "is-open",
              )}
              aria-label={
                isMenuOpen
                  ? profile.closeMenuLabel
                  : profile.openMenuLabel
              }
              aria-controls={menuId}
              aria-expanded={isMenuOpen}
              aria-haspopup="menu"
              onClick={handleToggleMenu}
            >
              <span className="fitquest-tab-bar__center-button-glow" />
              <span className="fitquest-tab-bar__center-icon-stack">
                <span className="fitquest-tab-bar__center-icon fitquest-tab-bar__center-icon--plus">
                  <FqIcon name="plus" size={24} strokeWidth={2.2} />
                </span>
                <span className="fitquest-tab-bar__center-icon fitquest-tab-bar__center-icon--close">
                  <FqIcon name="x" size={22} strokeWidth={2.2} />
                </span>
              </span>
            </button>
          </div>

          <div className="fitquest-tab-bar__cluster fitquest-tab-bar__cluster--right">
            {rightTabs.map(renderTab)}
          </div>
        </div>
      </nav>
    </div>
  );
}
