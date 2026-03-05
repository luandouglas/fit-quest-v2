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
  xs: 'min-h-20 px-3 py-2 text-xs',
  sm: 'min-h-24 px-4 py-3 text-sm',
  md: 'min-h-28 px-4 py-3 text-sm',
  lg: 'min-h-32 px-5 py-4 text-base',
}

const variantMap: Record<FqVariant, string> = {
  solid: 'border border-transparent bg-muted/80 hover:bg-muted',
  outline: 'border border-input bg-card shadow-sm',
  ghost: 'border-transparent bg-transparent',
}

const toneMap: Record<FqTone, string> = {
  primary: 'focus-visible:ring-ring focus-visible:border-primary',
  secondary: 'focus-visible:ring-secondary focus-visible:border-secondary',
  success: 'focus-visible:ring-success focus-visible:border-success',
  warning: 'focus-visible:ring-warning focus-visible:border-warning',
  danger: 'focus-visible:ring-destructive focus-visible:border-destructive',
  neutral: 'focus-visible:ring-ring focus-visible:border-foreground/30',
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
    <label className="flex w-full flex-col gap-2" htmlFor={textareaId}>
      {label ? <span className="text-sm font-medium text-foreground">{label}</span> : null}
      <textarea
        id={textareaId}
        className={cx(
          'w-full resize-y rounded-xl text-foreground outline-none transition duration-200 placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60',
          'focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-background',
          sizeMap[size],
          variantMap[variant],
          toneMap[tone],
          errorMessage ? 'border-destructive focus-visible:ring-destructive' : null,
          className,
        )}
       
        data-testid={testId}
        aria-invalid={Boolean(errorMessage)}
        disabled={isDisabled}
        {...rest}
      />
      {errorMessage ? (
        <span className="text-xs text-destructive">{errorMessage}</span>
      ) : helperText ? (
        <span className="text-xs text-muted-foreground/90">{helperText}</span>
      ) : null}
    </label>
  )
}
