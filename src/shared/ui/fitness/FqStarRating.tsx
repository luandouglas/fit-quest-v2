import { useMemo, useState } from 'react'

import { FqIcon } from '@/shared/ui/primitives/FqIcon'
import { clamp, cx } from '@/shared/utils'
import type { FqBaseProps, FqTone } from '@/shared/ui/types'

type FqStarRatingProps = FqBaseProps & {
  value?: number
  defaultValue?: number
  max?: number
  tone?: FqTone
  onChange?: (value: number) => void
  isDisabled?: boolean
}

const toneMap: Record<FqTone, string> = {
  primary: 'text-blue-500',
  secondary: 'text-slate-500',
  success: 'text-emerald-500',
  warning: 'text-amber-500',
  danger: 'text-rose-500',
  neutral: 'text-zinc-500',
}

export function FqStarRating({
  value,
  defaultValue = 3,
  max = 5,
  tone = 'warning',
  onChange,
  isDisabled = false,
  className,
  
  testId,
}: FqStarRatingProps) {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const isControlled = useMemo(() => value !== undefined, [value])
  const selectedValue = isControlled ? (value ?? internalValue) : internalValue
  const selected = clamp(selectedValue, 0, max)

  return (
    <div className={cx('inline-flex items-center gap-1', className)} data-testid={testId}>
      {Array.from({ length: max }, (_, index) => {
        const star = index + 1
        const isActive = star <= selected

        return (
          <button
            key={star}
            type="button"
            aria-label={`Avaliar com ${star} estrela${star > 1 ? 's' : ''}`}
            className={cx(
              'rounded p-0.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1',
              isActive ? toneMap[tone] : 'text-zinc-300',
            )}
            disabled={isDisabled}
            onClick={() => {
              if (!isControlled) {
                setInternalValue(star)
              }
              onChange?.(star)
            }}
          >
            <FqIcon name="star" size={18} fill={isActive ? 'currentColor' : 'none'} />
          </button>
        )
      })}
    </div>
  )
}
