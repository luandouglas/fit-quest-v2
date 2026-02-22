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
  xs: 'h-8 px-2 text-xs',
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-3 text-sm',
  lg: 'h-12 px-4 text-base',
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
    <label className="flex w-full flex-col gap-1.5" htmlFor={inputId}>
      {label ? <span className="text-sm font-medium text-zinc-700">{label}</span> : null}
      <span className="relative flex items-center">
        {leftIcon ? (
          <span className="pointer-events-none absolute left-3 text-zinc-500">
            <FqIcon name={leftIcon} size={16} />
          </span>
        ) : null}
        <input
          id={inputId}
          className={cx(
            'w-full rounded-xl text-zinc-900 outline-none transition placeholder:text-zinc-400 disabled:cursor-not-allowed disabled:opacity-60',
            'focus-visible:ring-2 focus-visible:ring-offset-1',
            sizeMap[size],
            variantMap[variant],
            toneMap[tone],
            leftIcon ? 'pl-10' : null,
            rightIcon ? 'pr-10' : null,
            errorMessage ? 'border-rose-500 focus-visible:ring-rose-500' : null,
            className,
          )}
         
          data-testid={testId}
          aria-invalid={Boolean(errorMessage)}
          disabled={isDisabled}
          {...inputProps}
        />
        {rightIcon ? (
          <span className="pointer-events-none absolute right-3 text-zinc-500">
            <FqIcon name={rightIcon} size={16} />
          </span>
        ) : null}
      </span>
      {errorMessage ? (
        <span className="text-xs text-rose-600">{errorMessage}</span>
      ) : helperText ? (
        <span className="text-xs text-zinc-500">{helperText}</span>
      ) : null}
    </label>
  )
}
