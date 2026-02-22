import type { ButtonHTMLAttributes } from 'react'

import { FqIcon, type IconName } from '@/shared/ui/primitives/FqIcon'
import { fqButtonSizeMap, fqToneVariantMap } from '@/shared/ui/tokens'
import { isFqSize, isFqTone, isFqVariant, type FqBaseProps, type FqSize, type FqTone, type FqVariant } from '@/shared/ui/types'
import { cx } from '@/shared/utils'

type FqButtonProps = FqBaseProps &
  Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'style' | 'className' | 'disabled'
  > & {
    variant?: FqVariant
    size?: FqSize
    tone?: FqTone
    isLoading?: boolean
    isDisabled?: boolean
    leftIcon?: IconName
    rightIcon?: IconName
  }

export function FqButton({
  variant = 'solid',
  size = 'md',
  tone = 'primary',
  isLoading = false,
  isDisabled = false,
  leftIcon,
  rightIcon,
  className,
  testId,
  children,
  ...rest
}: FqButtonProps) {
  const disabled = isDisabled || isLoading
  const resolvedSize: FqSize = isFqSize(size) ? size : 'md'
  const resolvedTone: FqTone = isFqTone(tone) ? tone : 'primary'
  const resolvedVariant: FqVariant = isFqVariant(variant) ? variant : 'solid'

  return (
    <button
      type="button"
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition disabled:cursor-not-allowed disabled:opacity-60',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        fqButtonSizeMap[resolvedSize],
        fqToneVariantMap[resolvedTone][resolvedVariant],
        className,
      )}
      data-testid={testId}
      disabled={disabled}
      {...rest}
    >
      {isLoading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
      ) : null}
      {!isLoading && leftIcon ? <FqIcon name={leftIcon} size={16} /> : null}
      <span>{children}</span>
      {!isLoading && rightIcon ? <FqIcon name={rightIcon} size={16} /> : null}
    </button>
  )
}
