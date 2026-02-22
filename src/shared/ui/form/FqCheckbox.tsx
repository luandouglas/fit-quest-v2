import type { InputHTMLAttributes, ReactNode } from 'react'

import type { FqBaseProps } from '@/shared/ui/types'
import { cx } from '@/shared/utils'

type FqCheckboxProps = FqBaseProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'style' | 'className' | 'type' | 'disabled'> & {
    label?: ReactNode
    helperText?: string
    isDisabled?: boolean
  }

export function FqCheckbox({
  label,
  helperText,
  isDisabled = false,
  className,
  
  testId,
  id,
  ...rest
}: FqCheckboxProps) {
  const inputId = id ?? `fq-checkbox-${testId ?? crypto.randomUUID()}`

  return (
    <label className={cx('flex w-fit items-start gap-2', className)} htmlFor={inputId}>
      <input
        id={inputId}
        type="checkbox"
        className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed"
        data-testid={testId}
        disabled={isDisabled}
        {...rest}
      />
      <span className="flex flex-col">
        {label ? <span className="text-sm font-medium text-zinc-800">{label}</span> : null}
        {helperText ? <span className="text-xs text-zinc-500">{helperText}</span> : null}
      </span>
    </label>
  )
}
