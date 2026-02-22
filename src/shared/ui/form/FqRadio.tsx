import type { InputHTMLAttributes, ReactNode } from 'react'

import type { FqBaseProps } from '@/shared/ui/types'
import { cx } from '@/shared/utils'

type FqRadioProps = FqBaseProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'style' | 'className' | 'type' | 'disabled'> & {
    label: ReactNode
    description?: string
    isDisabled?: boolean
  }

export function FqRadio({
  label,
  description,
  isDisabled = false,
  className,
  
  testId,
  id,
  ...rest
}: FqRadioProps) {
  const inputId = id ?? `fq-radio-${testId ?? crypto.randomUUID()}`

  return (
    <label className={cx('flex w-fit items-start gap-2', className)} htmlFor={inputId}>
      <input
        id={inputId}
        type="radio"
        className="mt-0.5 h-4 w-4 border-zinc-300 text-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed"
        data-testid={testId}
        disabled={isDisabled}
        {...rest}
      />
      <span className="flex flex-col">
        <span className="text-sm font-medium text-zinc-800">{label}</span>
        {description ? <span className="text-xs text-zinc-500">{description}</span> : null}
      </span>
    </label>
  )
}
