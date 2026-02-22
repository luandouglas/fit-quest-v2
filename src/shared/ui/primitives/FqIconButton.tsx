import type { ButtonHTMLAttributes } from 'react'

import { FqIcon, type IconName } from '@/shared/ui/primitives/FqIcon'
import { fqIconButtonSizeMap, fqToneVariantMap } from '@/shared/ui/tokens'
import type { FqBaseProps, FqSize, FqTone, FqVariant } from '@/shared/ui/types'
import { cx } from '@/shared/utils'

type FqIconButtonProps = FqBaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'style' | 'className' | 'disabled'> & {
    icon: IconName
    label: string
    variant?: FqVariant
    size?: FqSize
    tone?: FqTone
    isLoading?: boolean
    isDisabled?: boolean
  }

export function FqIconButton({
  icon,
  label,
  variant = 'ghost',
  size = 'md',
  tone = 'neutral',
  isLoading = false,
  isDisabled = false,
  className,
  
  testId,
  ...rest
}: FqIconButtonProps) {
  const disabled = isDisabled || isLoading

  return (
    <button
      type="button"
      aria-label={label}
      className={cx(
        'inline-flex items-center justify-center rounded-xl transition disabled:cursor-not-allowed disabled:opacity-60',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        fqIconButtonSizeMap[size],
        fqToneVariantMap[tone][variant],
        className,
      )}
     
      data-testid={testId}
      disabled={disabled}
      {...rest}
    >
      {isLoading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
      ) : (
        <FqIcon name={icon} size={16} />
      )}
    </button>
  )
}
