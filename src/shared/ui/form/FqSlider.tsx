import type { InputHTMLAttributes } from 'react'

import type { FqBaseProps, FqTone } from '@/shared/ui/types'
import { cx } from '@/shared/utils'

type FqSliderProps = FqBaseProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'style' | 'className' | 'type'> & {
    label?: string
    tone?: FqTone
  }

const toneMap: Record<FqTone, string> = {
  primary: 'accent-blue-600',
  secondary: 'accent-slate-600',
  success: 'accent-emerald-600',
  warning: 'accent-amber-500',
  danger: 'accent-rose-600',
  neutral: 'accent-zinc-900',
}

export function FqSlider({
  label,
  tone = 'primary',
  className,
  
  testId,
  id,
  ...rest
}: FqSliderProps) {
  const sliderId = id ?? `fq-slider-${testId ?? crypto.randomUUID()}`

  return (
    <label className="flex w-full flex-col gap-2" htmlFor={sliderId}>
      {label ? <span className="text-sm font-medium text-zinc-700">{label}</span> : null}
      <input
        id={sliderId}
        type="range"
        className={cx('h-2 w-full cursor-pointer rounded-lg bg-zinc-200', toneMap[tone], className)}
       
        data-testid={testId}
        {...rest}
      />
    </label>
  )
}
