import type { HTMLAttributes } from 'react'

import { cx } from '@/shared/utils'
import type { FqBaseProps } from '@/shared/ui/types'

export type FqTimelineItem = {
  id: string
  title: string
  description?: string
  time?: string
}

type FqTimelineProps = FqBaseProps &
  Omit<HTMLAttributes<HTMLUListElement>, 'style' | 'className'> & {
    items: FqTimelineItem[]
  }

export function FqTimeline({
  items,
  className,
  
  testId,
  ...rest
}: FqTimelineProps) {
  return (
    <ul
      className={cx('space-y-4 rounded-xl border border-zinc-200 bg-white p-4', className)}
     
      data-testid={testId}
      {...rest}
    >
      {items.map((item) => (
        <li key={item.id} className="relative pl-6">
          <span className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-blue-500" />
          <span className="absolute left-[4px] top-4 h-[calc(100%-0.5rem)] w-px bg-zinc-200" />
          <p className="text-sm font-semibold text-zinc-900">{item.title}</p>
          {item.description ? <p className="text-sm text-zinc-600">{item.description}</p> : null}
          {item.time ? <p className="text-xs text-zinc-500">{item.time}</p> : null}
        </li>
      ))}
    </ul>
  )
}
