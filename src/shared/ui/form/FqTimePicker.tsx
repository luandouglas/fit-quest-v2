import type { InputHTMLAttributes } from 'react'

import type { FqBaseProps } from '@/shared/ui/types'
import { cx } from '@/shared/utils'

type FqTimePickerProps = FqBaseProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'style' | 'className' | 'disabled'> & {
    label?: string
    helperText?: string
    errorMessage?: string
    isDisabled?: boolean
  }

export function FqTimePicker({
  label,
  helperText,
  errorMessage,
  isDisabled = false,
  className,
  
  testId,
  id,
  ...rest
}: FqTimePickerProps) {
  const inputId = id ?? `fq-time-${testId ?? crypto.randomUUID()}`

  return (
    <label className="flex w-full flex-col gap-1.5" htmlFor={inputId}>
      {label ? <span className="text-sm font-medium text-zinc-700">{label}</span> : null}
      <input
        id={inputId}
        type="time"
        className={cx(
          'h-10 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition',
          'focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60',
          errorMessage ? 'border-rose-500 focus-visible:ring-rose-500' : null,
          className,
        )}
       
        data-testid={testId}
        aria-invalid={Boolean(errorMessage)}
        disabled={isDisabled}
        {...rest}
      />
      {errorMessage ? (
        <span className="text-xs text-rose-600">{errorMessage}</span>
      ) : helperText ? (
        <span className="text-xs text-zinc-500">{helperText}</span>
      ) : null}
    </label>
  )
}
