import type { SelectHTMLAttributes } from 'react'

import type { FqBaseProps } from '@/shared/ui/types'
import { cx } from '@/shared/utils'

export type FqMultiSelectOption = {
  label: string
  value: string
}

type FqMultiSelectProps = FqBaseProps &
  Omit<
    SelectHTMLAttributes<HTMLSelectElement>,
    'style' | 'className' | 'multiple' | 'value' | 'defaultValue'
  > & {
    label?: string
    helperText?: string
    errorMessage?: string
    options: FqMultiSelectOption[]
    value?: string[]
    defaultValue?: string[]
    onValueChange?: (value: string[]) => void
    isDisabled?: boolean
  }

export function FqMultiSelect({
  label,
  helperText,
  errorMessage,
  options,
  value,
  defaultValue,
  onValueChange,
  onChange,
  isDisabled = false,
  className,
  
  testId,
  id,
  ...rest
}: FqMultiSelectProps) {
  const selectId = id ?? `fq-multiselect-${testId ?? crypto.randomUUID()}`

  return (
    <label className="flex w-full flex-col gap-1.5" htmlFor={selectId}>
      {label ? <span className="text-sm font-medium text-zinc-700">{label}</span> : null}
      <select
        id={selectId}
        multiple
        value={value}
        defaultValue={defaultValue}
        onChange={(event) => {
          const values = Array.from(event.target.selectedOptions).map((option) => option.value)
          onValueChange?.(values)
          onChange?.(event)
        }}
        className={cx(
          'min-h-32 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition',
          'focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1',
          'disabled:cursor-not-allowed disabled:opacity-60',
          errorMessage ? 'border-rose-500 focus-visible:ring-rose-500' : null,
          className,
        )}
       
        data-testid={testId}
        aria-invalid={Boolean(errorMessage)}
        disabled={isDisabled}
        {...rest}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {errorMessage ? (
        <span className="text-xs text-rose-600">{errorMessage}</span>
      ) : helperText ? (
        <span className="text-xs text-zinc-500">{helperText}</span>
      ) : null}
    </label>
  )
}
