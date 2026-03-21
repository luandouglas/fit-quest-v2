import type { HTMLAttributes } from 'react'

import { cx } from '@/shared/utils'
import type { FqBaseProps } from '@/shared/ui/types'

type FqSectionProps = FqBaseProps &
  Omit<HTMLAttributes<HTMLElement>, 'style' | 'className'> & {
    title?: string
    description?: string
  }

export function FqSection({
  title,
  description,
  className,
  
  testId,
  children,
  ...rest
}: FqSectionProps) {
  return (
    <section
      className={cx('space-y-3 rounded-lg border border-zinc-200 bg-white p-4', className)}
     
      data-testid={testId}
      {...rest}
    >
      {title || description ? (
        <header className="space-y-1">
          {title ? <h2 className="text-section-title font-semibold text-foreground">{title}</h2> : null}
          {description ? <p className="text-sm text-zinc-500">{description}</p> : null}
        </header>
      ) : null}
      {children}
    </section>
  )
}
