import type { HTMLAttributes } from 'react'

import { FqIcon } from '@/shared/ui/primitives/FqIcon'
import { cx } from '@/shared/utils'
import type { FqBaseProps } from '@/shared/ui/types'

export type FqBreadcrumbItem = {
  label: string
  href?: string
  isCurrent?: boolean
  onClick?: () => void
}

type FqBreadcrumbProps = FqBaseProps &
  Omit<HTMLAttributes<HTMLElement>, 'style' | 'className'> & {
    items: FqBreadcrumbItem[]
  }

export function FqBreadcrumb({
  items,
  className,
  
  testId,
  ...rest
}: FqBreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cx('w-full', className)}
     
      data-testid={testId}
      {...rest}
    >
      <ol className="flex flex-wrap items-center gap-2 text-sm text-zinc-500">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
            {index > 0 ? <FqIcon name="chevronRight" size={14} className="text-zinc-400" /> : null}
            {item.href ? (
              <a
                href={item.href}
                onClick={item.onClick}
                aria-current={item.isCurrent ? 'page' : undefined}
                className={cx(
                  'rounded px-1 py-0.5 transition hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1',
                  item.isCurrent ? 'font-medium text-zinc-900' : null,
                )}
              >
                {item.label}
              </a>
            ) : (
              <button
                type="button"
                onClick={item.onClick}
                aria-current={item.isCurrent ? 'page' : undefined}
                className={cx(
                  'rounded px-1 py-0.5 text-left transition hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1',
                  item.isCurrent ? 'font-medium text-zinc-900' : null,
                )}
              >
                {item.label}
              </button>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
