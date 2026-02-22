import type { HTMLAttributes, ReactNode } from 'react'

import { cx } from '@/shared/utils'
import type { FqBaseProps } from '@/shared/ui/types'

type FqCardProps = FqBaseProps &
  Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'className'> & {
    header?: ReactNode
    footer?: ReactNode
    title?: string
    subtitle?: string
  }

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
      className={cx('rounded-2xl border border-zinc-200 bg-white shadow-sm', className)}
     
      data-testid={testId}
      {...rest}
    >
      {header || title || subtitle ? (
        <header className="border-b border-zinc-100 px-5 py-4">
          {header}
          {title ? <h3 className="text-base font-semibold text-zinc-900">{title}</h3> : null}
          {subtitle ? <p className="text-sm text-zinc-500">{subtitle}</p> : null}
        </header>
      ) : null}
      <div className="px-5 py-4">{children}</div>
      {footer ? <footer className="border-t border-zinc-100 px-5 py-4">{footer}</footer> : null}
    </section>
  )
}
