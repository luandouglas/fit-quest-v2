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
        "fq-raise-hover fq-soft-reveal w-full rounded-[calc(var(--radius)+2px)] border border-border/70 bg-card shadow-[0_10px_28px_rgba(15,23,42,0.06)]",
        className,
      )}
      data-testid={testId}
      {...rest}
    >
      {header || title || subtitle ? (
        <header className="border-b border-border/70 px-4 py-4 md:px-6">
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
      <div className="px-4 py-4 md:px-6">{children}</div>
      {footer ? (
        <footer className="border-t border-border/70 px-4 py-4 md:px-6">
          {footer}
        </footer>
      ) : null}
    </section>
  );
}
