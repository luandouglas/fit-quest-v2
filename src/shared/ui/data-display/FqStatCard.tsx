import type { HTMLAttributes } from 'react'

import { FqIcon, type IconName } from '@/shared/ui/primitives/FqIcon'
import { cx } from '@/shared/utils'
import type { FqBaseProps } from '@/shared/ui/types'

type FqStatCardProps = FqBaseProps &
  Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'className'> & {
    label: string
    value: string | number
    delta?: string
    icon?: IconName
  }

export function FqStatCard({
  label,
  value,
  delta,
  icon,
  className,
  
  testId,
  ...rest
}: FqStatCardProps) {
  return (
    <div
      className={cx('rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm', className)}
     
      data-testid={testId}
      {...rest}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-500">{label}</span>
        {icon ? <FqIcon name={icon} size={16} className="text-zinc-500" /> : null}
      </div>
      <p className="mt-2 text-2xl font-semibold text-zinc-900">{value}</p>
      {delta ? <p className="mt-1 text-xs text-emerald-600">{delta}</p> : null}
    </div>
  )
}
