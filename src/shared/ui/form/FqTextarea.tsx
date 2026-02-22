import type { TextareaHTMLAttributes } from 'react'

import type { FqBaseProps, FqSize, FqTone, FqVariant } from '@/shared/ui/types'
import { cx } from '@/shared/utils'

type FqTextareaProps = FqBaseProps &
  Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    'style' | 'className' | 'disabled'
  > & {
    label?: string
    helperText?: string
    errorMessage?: string
    variant?: FqVariant
    size?: FqSize
    tone?: FqTone
    isDisabled?: boolean
  }

const sizeMap: Record<FqSize, string> = {
  xs: 'min-h-20 px-2 py-1.5 text-xs',
  sm: 'min-h-24 px-3 py-2 text-sm',
  md: 'min-h-28 px-3 py-2.5 text-sm',
  lg: 'min-h-32 px-4 py-3 text-base',
}

const variantMap: Record<FqVariant, string> = {
  solid: 'border-transparent bg-zinc-100 hover:bg-zinc-200',
  outline: 'border border-zinc-300 bg-white',
  ghost: 'border-transparent bg-transparent',
}

const toneMap: Record<FqTone, string> = {
  primary: 'focus-visible:ring-blue-500 focus-visible:border-blue-500',
  secondary: 'focus-visible:ring-slate-500 focus-visible:border-slate-500',
  success: 'focus-visible:ring-emerald-500 focus-visible:border-emerald-500',
  warning: 'focus-visible:ring-amber-500 focus-visible:border-amber-500',
  danger: 'focus-visible:ring-rose-500 focus-visible:border-rose-500',
  neutral: 'focus-visible:ring-zinc-500 focus-visible:border-zinc-500',
}

export function FqTextarea({
  label,
  helperText,
  errorMessage,
  variant = 'outline',
  size = 'md',
  tone = 'primary',
  isDisabled = false,
  className,
  
  testId,
  id,
  ...rest
}: FqTextareaProps) {
  const textareaId = id ?? `fq-textarea-${testId ?? crypto.randomUUID()}`

  return (
    <label className="flex w-full flex-col gap-1.5" htmlFor={textareaId}>
      {label ? <span className="text-sm font-medium text-zinc-700">{label}</span> : null}
      <textarea
        id={textareaId}
        className={cx(
          'w-full resize-y rounded-xl text-zinc-900 outline-none transition placeholder:text-zinc-400 disabled:cursor-not-allowed disabled:opacity-60',
          'focus-visible:ring-2 focus-visible:ring-offset-1',
          sizeMap[size],
          variantMap[variant],
          toneMap[tone],
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
