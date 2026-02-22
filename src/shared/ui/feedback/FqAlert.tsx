import type { HTMLAttributes } from 'react'

import { FqIcon, type IconName } from '@/shared/ui/primitives/FqIcon'
import type { FqBaseProps, FqTone } from '@/shared/ui/types'
import { cx } from '@/shared/utils'

const toneMap: Record<FqTone, string> = {
  primary: 'border-primary/30 bg-primary/10 text-foreground',
  secondary: 'border-secondary/30 bg-secondary/10 text-foreground',
  success: 'border-success/30 bg-success/10 text-foreground',
  warning: 'border-warning/40 bg-warning/15 text-warning-foreground',
  danger: 'border-destructive/30 bg-destructive/10 text-foreground',
  neutral: 'border-border bg-muted/60 text-foreground',
}

const iconToneMap: Record<FqTone, IconName> = {
  primary: 'info',
  secondary: 'info',
  success: 'check',
  warning: 'alertTriangle',
  danger: 'alertCircle',
  neutral: 'info',
}

type FqAlertProps = FqBaseProps &
  Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'className'> & {
    tone?: FqTone
    title?: string
  }

export function FqAlert({
  tone = 'neutral',
  title,
  className,
  testId,
  children,
  ...rest
}: FqAlertProps) {
  return (
    <div
      role="alert"
      className={cx('flex items-start gap-3 rounded-xl border p-3 text-sm', toneMap[tone], className)}
      data-testid={testId}
      {...rest}
    >
      <FqIcon name={iconToneMap[tone]} size={16} className="mt-0.5" />
      <div>
        {title ? <p className="font-semibold">{title}</p> : null}
        <div>{children}</div>
      </div>
    </div>
  )
}
