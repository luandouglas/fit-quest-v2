import type { FqSidebarSectionDef } from "./fq-sidebar.types";
import { FqSidebarItem } from "./FqSidebarItem";

type FqSidebarSectionProps = {
  section: FqSidebarSectionDef;
  pathname: string;
  onNavigate: (path: string) => void;
};

export function FqSidebarSection({
  section,
  pathname,
  onNavigate,
}: FqSidebarSectionProps) {
  if (section.items.length === 0) return null;

  return (
    <div className="fq-sidebar-section">
      <p className="fq-sidebar-section__title">{section.title}</p>
      {section.items.map((item) => (
        <FqSidebarItem
          key={item.id}
          item={item}
          pathname={pathname}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
}
