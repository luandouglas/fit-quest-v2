import { FqIcon } from "@/shared/ui";

type FqSidebarSearchProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function FqSidebarSearch({
  value,
  onChange,
  placeholder = "Buscar no FitQuest",
}: FqSidebarSearchProps) {
  return (
    <div className="fq-sidebar-search">
      <div className="fq-sidebar-search__wrapper">
        <span className="fq-sidebar-search__icon">
          <FqIcon name="search" size={15} strokeWidth={1.8} />
        </span>
        <input
          type="text"
          className="fq-sidebar-search__input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={placeholder}
        />
      </div>
    </div>
  );
}
