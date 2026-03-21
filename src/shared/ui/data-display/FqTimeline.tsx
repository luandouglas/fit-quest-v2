import type { HTMLAttributes } from 'react'

import { cx } from '@/shared/utils'
import type { FqBaseProps, FqTone } from '@/shared/ui/types'

export type FqTimelineItem = {
  id: string
  title: string
  description?: string
  time?: string
  tone?: FqTone
}

type FqTimelineProps = FqBaseProps &
  Omit<HTMLAttributes<HTMLUListElement>, 'style' | 'className'> & {
    items: FqTimelineItem[]
  }

const timelineToneMap: Record<FqTone, string> = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-destructive',
  neutral: 'bg-muted-foreground',
}

export function FqTimeline({
  items,
  className,
  
  testId,
  ...rest
}: FqTimelineProps) {
  return (
    <ul
      className={cx('space-y-4 rounded-lg border border-border bg-card p-4', className)}
     
      data-testid={testId}
      {...rest}
    >
      {items.map((item, index) => {
        const tone = item.tone ?? 'primary'

        return (
          <li key={item.id} className="relative pl-6">
            <span className={cx('absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full', timelineToneMap[tone])} />
            {index < items.length - 1 ? <span className="absolute left-1 top-4 fq-h-page-fill w-px bg-border" /> : null}
            <p className="text-sm font-semibold text-card-foreground">{item.title}</p>
            {item.description ? <p className="text-sm text-muted-foreground">{item.description}</p> : null}
            {item.time ? <p className="text-xs text-muted-foreground">{item.time}</p> : null}
          </li>
        )
      })}
    </ul>
  )
}
