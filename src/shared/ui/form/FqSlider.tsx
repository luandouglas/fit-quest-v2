import type { InputHTMLAttributes } from 'react'

import type { FqBaseProps, FqTone } from '@/shared/ui/types'
import { cx } from '@/shared/utils'

type FqSliderProps = FqBaseProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'style' | 'className' | 'type'> & {
    label?: string
    tone?: FqTone
  }

const toneMap: Record<FqTone, string> = {
  primary: 'accent-primary',
  secondary: 'accent-secondary',
  success: 'accent-success',
  warning: 'accent-warning',
  danger: 'accent-destructive',
  neutral: 'accent-foreground',
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
      {label ? <span className="text-label font-medium text-foreground">{label}</span> : null}
      <input
        id={sliderId}
        type="range"
        className={cx('h-2 w-full cursor-pointer rounded-lg bg-muted', toneMap[tone], className)}
       
        data-testid={testId}
        {...rest}
      />
    </label>
  )
}
