import type { HTMLAttributes, ReactNode } from "react";

import { cx } from "@/shared/utils";
import type { FqBaseProps } from "@/shared/ui/types";

type FqCardProps = FqBaseProps &
  Omit<HTMLAttributes<HTMLDivElement>, "style" | "className"> & {
    header?: ReactNode;
    footer?: ReactNode;
    title?: string;
    subtitle?: string;
  };

export function FqCard({
  header,
  footer,
  title,
  subtitle,
  className,

  testId,
  children,
  ...rest
}: FqCardProps) {
  return (
    <section
      className={cx(
        "fq-raise-hover fq-soft-reveal relative isolate w-full overflow-hidden rounded-[calc(var(--radius)+8px)] border border-border/80 bg-card/92 shadow-[0_20px_44px_rgba(60,73,66,0.08)] backdrop-blur",
        className,
      )}
      data-testid={testId}
      {...rest}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-[linear-gradient(180deg,rgba(255,255,255,0.42)_0%,rgba(255,255,255,0)_100%)] opacity-80"
      />
      {header || title || subtitle ? (
        <header className="relative border-b border-border/70 px-5 py-5 md:px-7">
          {header}
          {title ? (
            <h3 className="text-base font-semibold text-card-foreground">
              {title}
            </h3>
          ) : null}
          {subtitle ? (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </header>
      ) : null}
      <div className="relative px-5 py-5 md:px-7">{children}</div>
      {footer ? (
        <footer className="relative border-t border-border/70 px-5 py-5 md:px-7">
          {footer}
        </footer>
      ) : null}
    </section>
  );
}
