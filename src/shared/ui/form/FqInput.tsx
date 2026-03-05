import type { InputHTMLAttributes, ReactNode } from 'react'

import { FqIcon, type IconName } from '@/shared/ui/primitives/FqIcon'
import type { FqBaseProps, FqSize, FqTone, FqVariant } from '@/shared/ui/types'
import { cx } from '@/shared/utils'

type FqInputProps = FqBaseProps &
  Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'style' | 'className' | 'size' | 'disabled' | 'children'
  > & {
    label?: string
    helperText?: string
    errorMessage?: string
    variant?: FqVariant
    size?: FqSize
    tone?: FqTone
    isDisabled?: boolean
    leftIcon?: IconName
    rightIcon?: IconName
  }

const sizeMap: Record<FqSize, string> = {
  xs: 'h-8 px-3 text-xs',
  sm: 'h-10 px-4 text-sm',
  md: 'h-12 px-4 text-sm',
  lg: 'h-14 px-5 text-base',
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

export function FqInput({
  label,
  helperText,
  errorMessage,
  variant = 'outline',
  size = 'md',
  tone = 'primary',
  isDisabled = false,
  leftIcon,
  rightIcon,
  className,
  testId,
  id,
  ...rest
}: FqInputProps) {
  const inputProps = { ...rest } as InputHTMLAttributes<HTMLInputElement> & {
    children?: ReactNode
  }
  delete inputProps.children

  const inputId = id ?? `fq-input-${testId ?? crypto.randomUUID()}`

  return (
    <label className="flex w-full flex-col gap-2" htmlFor={inputId}>
      {label ? <span className="text-sm font-medium text-foreground">{label}</span> : null}
      <span className="relative flex items-center">
        {leftIcon ? (
          <span className="pointer-events-none absolute left-3 text-muted-foreground">
            <FqIcon name={leftIcon} size={16} />
          </span>
        ) : null}
        <input
          id={inputId}
          className={cx(
            'w-full rounded-xl text-foreground outline-none transition duration-200 placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60',
            'focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-background',
            sizeMap[size],
            variantMap[variant],
            toneMap[tone],
            leftIcon ? 'pl-10' : null,
            rightIcon ? 'pr-10' : null,
            errorMessage ? 'border-destructive focus-visible:ring-destructive' : null,
            className,
          )}
          data-testid={testId}
          aria-invalid={Boolean(errorMessage)}
          disabled={isDisabled}
          {...inputProps}
        />
        {rightIcon ? (
          <span className="pointer-events-none absolute right-3 text-muted-foreground">
            <FqIcon name={rightIcon} size={16} />
          </span>
        ) : null}
      </span>
      {errorMessage ? (
        <span className="text-xs text-destructive">{errorMessage}</span>
      ) : helperText ? (
        <span className="text-xs text-muted-foreground/90">{helperText}</span>
      ) : null}
    </label>
  )
}
