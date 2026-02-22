import { useMemo, useState, type ButtonHTMLAttributes } from 'react'

import { cx } from '@/shared/utils'
import type { FqBaseProps } from '@/shared/ui/types'

type FqChipProps = FqBaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'style' | 'className' | 'disabled'> & {
    selected?: boolean
    defaultSelected?: boolean
    onSelectedChange?: (selected: boolean) => void
    isDisabled?: boolean
  }

export function FqChip({
  selected,
  defaultSelected = false,
  onSelectedChange,
  isDisabled = false,
  className,
  
  testId,
  children,
  ...rest
}: FqChipProps) {
  const [internalSelected, setInternalSelected] = useState(defaultSelected)
  const isControlled = useMemo(() => selected !== undefined, [selected])
  const value = isControlled ? selected : internalSelected

  return (
    <button
      type="button"
      className={cx(
        'inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium transition',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1',
        value
          ? 'border-blue-500 bg-blue-100 text-blue-700'
          : 'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50',
        'disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
     
      data-testid={testId}
      disabled={isDisabled}
      onClick={(event) => {
        const nextValue = !value

        if (!isControlled) {
          setInternalSelected(nextValue)
        }

        onSelectedChange?.(nextValue)
        rest.onClick?.(event)
      }}
      {...rest}
    >
      {children}
    </button>
  )
}
