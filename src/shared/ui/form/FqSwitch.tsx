import { useMemo, useState } from 'react'

import type { FqBaseProps } from '@/shared/ui/types'
import { cx } from '@/shared/utils'

type FqSwitchProps = FqBaseProps & {
  label?: string
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  isDisabled?: boolean
  tone?: 'primary' | 'success' | 'danger' | 'neutral'
}

const toneMap: Record<NonNullable<FqSwitchProps['tone']>, string> = {
  primary: 'bg-blue-600',
  success: 'bg-emerald-600',
  danger: 'bg-rose-600',
  neutral: 'bg-zinc-900',
}

export function FqSwitch({
  label,
  checked,
  defaultChecked = false,
  onCheckedChange,
  isDisabled = false,
  tone = 'primary',
  className,
  
  testId,
}: FqSwitchProps) {
  const [internalChecked, setInternalChecked] = useState(defaultChecked)
  const isControlled = useMemo(() => checked !== undefined, [checked])
  const value = isControlled ? checked : internalChecked

  const handleToggle = () => {
    if (isDisabled) {
      return
    }

    const nextValue = !value

    if (!isControlled) {
      setInternalChecked(nextValue)
    }

    onCheckedChange?.(nextValue)
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      aria-label={label}
      onClick={handleToggle}
      className={cx(
        'inline-flex items-center gap-2 rounded-xl p-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        className,
      )}
     
      data-testid={testId}
      disabled={isDisabled}
    >
      <span
        className={cx(
          'relative inline-flex h-6 w-11 items-center rounded-full transition',
          value ? toneMap[tone] : 'bg-zinc-300',
        )}
      >
        <span
          className={cx(
            'inline-block h-5 w-5 transform rounded-full bg-white shadow transition',
            value ? 'translate-x-5' : 'translate-x-0.5',
          )}
        />
      </span>
      {label ? <span className="text-sm font-medium text-zinc-800">{label}</span> : null}
    </button>
  )
}
