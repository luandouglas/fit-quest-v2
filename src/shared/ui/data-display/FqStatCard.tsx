import type { HTMLAttributes } from 'react'

import { FqIcon, type IconName } from '@/shared/ui/primitives/FqIcon'
import { cx } from '@/shared/utils'
import type { FqBaseProps } from '@/shared/ui/types'

type FqStatCardProps = FqBaseProps &
  Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'className'> & {
    label: string
    value: string | number
    delta?: string
    helperText?: string
    icon?: IconName
  }

export function FqStatCard({
  label,
  value,
  delta,
  helperText,
  icon,
  className,
  
  testId,
  ...rest
}: FqStatCardProps) {
  return (
    <div
      className={cx('rounded-xl border border-border bg-card p-4 shadow-sm', className)}
     
      data-testid={testId}
      {...rest}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        {icon ? <FqIcon name={icon} size={16} className="text-muted-foreground" /> : null}
      </div>
      <p className="mt-2 text-2xl font-semibold text-card-foreground">{value}</p>
      {delta ? <p className="mt-1 text-xs text-success">{delta}</p> : null}
      {helperText ? <p className="mt-1 text-xs text-muted-foreground">{helperText}</p> : null}
    </div>
  )
}
