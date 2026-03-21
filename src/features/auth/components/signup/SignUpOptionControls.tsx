import { FqIcon, FqText } from "@/shared/ui/primitives";
import type { IconName } from "@/shared/ui/primitives";
import { cx } from "@/shared/utils";

export function SignUpChoiceChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cx(
        "rounded-full border px-4 py-2.5 text-sm font-semibold transition",
        selected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:border-primary/20 hover:bg-muted/70",
      )}
    >
      {label}
    </button>
  );
}

export function SignUpSelectionCard({
  label,
  description,
  icon,
  selected,
  onClick,
}: {
  label: string;
  description?: string;
  icon?: IconName;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cx(
        "w-full rounded-2xl border bg-card p-4 text-left transition sm:p-5",
        selected
          ? "border-primary/35 bg-primary/10 shadow-float"
          : "border-border hover:border-primary/20 hover:bg-muted/40",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {icon ? (
            <span
              className={cx(
                "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
                selected
                  ? "border-primary/20 bg-primary text-primary-foreground"
                  : "border-border/70 bg-muted/70 text-foreground",
              )}
            >
              <FqIcon name={icon} size={17} />
            </span>
          ) : null}

          <div className="space-y-1">
            <FqText as="p" className="text-sm font-semibold text-foreground">
              {label}
            </FqText>
            {description ? (
              <FqText className="text-sm leading-6 text-muted-foreground">
                {description}
              </FqText>
            ) : null}
          </div>
        </div>

        <span
          className={cx(
            "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
            selected
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-transparent",
          )}
        >
          <FqIcon name="check" size={13} />
        </span>
      </div>
    </button>
  );
}
