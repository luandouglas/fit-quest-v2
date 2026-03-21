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
        "fq-raise-hover fq-soft-reveal relative isolate w-full overflow-hidden rounded-xl border border-border/80 bg-card/90 shadow-float backdrop-blur",
        className,
      )}
      data-testid={testId}
      {...rest}
    >
      <div
        aria-hidden="true"
        className="fq-gradient-overlay-top pointer-events-none absolute inset-x-0 top-0 h-16 opacity-80"
      />
      {header || title || subtitle ? (
        <header className="relative border-b border-border/70 px-4 py-4 md:px-5">
          {header}
          {title ? (
            <h3 className="text-card-title font-semibold text-card-foreground">
              {title}
            </h3>
          ) : null}
          {subtitle ? (
            <p className="text-description text-muted-foreground">{subtitle}</p>
          ) : null}
        </header>
      ) : null}
      <div className="relative px-4 py-4 md:px-5">{children}</div>
      {footer ? (
        <footer className="relative border-t border-border/70 px-4 py-4 md:px-5">
          {footer}
        </footer>
      ) : null}
    </section>
  );
}
