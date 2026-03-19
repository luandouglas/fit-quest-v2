import { useState } from 'react'
import type { HTMLAttributes } from 'react'

import { cx } from '@/shared/utils'
import type { FqBaseProps } from '@/shared/ui/types'

export type AccordionEntry = {
  id: string
  title: string
  content: React.ReactNode
}

type AccordionProps = FqBaseProps &
  Omit<HTMLAttributes<HTMLDivElement>, 'items'> & {
    items: AccordionEntry[]
    multiple?: boolean
  }

export function Accordion({
  items,
  multiple = false,
  className,
  style,
  testId,
  ...props
}: AccordionProps) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null)

  return (
    <div
      className={cx('overflow-hidden rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface)', className)}
      style={style}
      data-testid={testId}
      {...props}
    >
      {items.map((item, index) => {
        const isOpen = multiple ? undefined : openId === item.id

        return (
          <details
            key={item.id}
            open={isOpen}
            onToggle={(event) => {
              if (!multiple) {
                const details = event.currentTarget
                setOpenId(details.open ? item.id : null)
              }
            }}
            className={cx(index < items.length - 1 ? 'border-b border-(--color-border)' : '')}
          >
            <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-(--color-text)">
              {item.title}
            </summary>
            <div className="px-4 pb-3 text-sm text-(--color-text-muted)">{item.content}</div>
          </details>
        )
      })}
    </div>
  )
}
