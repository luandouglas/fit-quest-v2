import type { HTMLAttributes } from 'react'

import { FqIcon, type IconName } from '@/shared/ui/primitives/FqIcon'
import { fqBadgeToneMap } from '@/shared/ui/tokens'
import type { FqBaseProps, FqTone } from '@/shared/ui/types'
import { cx } from '@/shared/utils'

type FqTagProps = FqBaseProps &
  Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'className'> & {
    tone?: FqTone
    leftIcon?: IconName
    rightIcon?: IconName
  }

export function FqTag({
  tone = 'neutral',
  leftIcon,
  rightIcon,
  className,
  
  testId,
  children,
  ...rest
}: FqTagProps) {
  return (
    <div
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full border border-transparent px-3 py-1.5 text-caption font-semibold tracking-tight shadow-card',
        fqBadgeToneMap[tone],
        className,
      )}
     
      data-testid={testId}
      {...rest}
    >
      {leftIcon ? <FqIcon name={leftIcon} size={12} /> : null}
      <span>{children}</span>
      {rightIcon ? <FqIcon name={rightIcon} size={12} /> : null}
    </div>
  )
}
