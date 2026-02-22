import type { HTMLAttributes } from 'react'

import { FqIcon, type IconName } from '@/shared/ui/primitives/FqIcon'
import type { FqBaseProps, FqTone } from '@/shared/ui/types'
import { cx } from '@/shared/utils'

const toneMap: Record<FqTone, string> = {
  primary: 'border-blue-200 bg-blue-50 text-blue-900',
  secondary: 'border-slate-200 bg-slate-50 text-slate-900',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  danger: 'border-rose-200 bg-rose-50 text-rose-900',
  neutral: 'border-zinc-200 bg-zinc-50 text-zinc-900',
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
