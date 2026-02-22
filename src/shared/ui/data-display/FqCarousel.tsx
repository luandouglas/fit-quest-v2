import { useMemo, useState, type HTMLAttributes, type ReactNode } from 'react'

import { FqIconButton } from '@/shared/ui/primitives/FqIconButton'
import { clamp, cx } from '@/shared/utils'
import type { FqBaseProps } from '@/shared/ui/types'

type FqCarouselProps = FqBaseProps &
  Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'className'> & {
    items: ReactNode[]
    initialIndex?: number
  }

export function FqCarousel({
  items,
  initialIndex = 0,
  className,
  
  testId,
  ...rest
}: FqCarouselProps) {
  const safeInitialIndex = useMemo(
    () => clamp(initialIndex, 0, Math.max(items.length - 1, 0)),
    [initialIndex, items.length],
  )
  const [index, setIndex] = useState(safeInitialIndex)

  if (!items.length) {
    return null
  }

  const maxIndex = Math.max(items.length - 1, 0)

  return (
    <div
      className={cx('space-y-3 rounded-2xl border border-zinc-200 bg-white p-4', className)}
     
      data-testid={testId}
      {...rest}
    >
      <div className="overflow-hidden rounded-xl bg-zinc-50 p-4">{items[index]}</div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-500">
          Item {index + 1} de {items.length}
        </span>
        <div className="flex items-center gap-1">
          <FqIconButton
            icon="chevronLeft"
            label="Previous item"
            size="sm"
            onClick={() => setIndex((current) => clamp(current - 1, 0, maxIndex))}
            isDisabled={index <= 0}
          />
          <FqIconButton
            icon="chevronRight"
            label="Next item"
            size="sm"
            onClick={() => setIndex((current) => clamp(current + 1, 0, maxIndex))}
            isDisabled={index >= maxIndex}
          />
        </div>
      </div>
    </div>
  )
}
