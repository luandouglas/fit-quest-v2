import type { SVGAttributes } from 'react'

import { clamp, cx } from '@/shared/utils'
import type { FqBaseProps, FqTone } from '@/shared/ui/types'

type FqProgressRingProps = FqBaseProps &
  Omit<SVGAttributes<SVGSVGElement>, 'style' | 'className'> & {
    value: number
    max?: number
    size?: number
    strokeWidth?: number
    tone?: FqTone
    label?: string
  }

const toneMap: Record<FqTone, string> = {
  primary: 'stroke-blue-600',
  secondary: 'stroke-slate-600',
  success: 'stroke-emerald-600',
  warning: 'stroke-amber-500',
  danger: 'stroke-rose-600',
  neutral: 'stroke-zinc-900',
}

export function FqProgressRing({
  value,
  max = 100,
  size = 120,
  strokeWidth = 10,
  tone = 'primary',
  label,
  className,
  
  testId,
  ...rest
}: FqProgressRingProps) {
  const safeMax = Math.max(max, 1)
  const percent = clamp((value / safeMax) * 100, 0, 100)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (percent / 100) * circumference

  return (
    <div className={cx('relative inline-flex items-center justify-center', className)} data-testid={testId}>
      <svg width={size} height={size} className="-rotate-90" {...rest}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="fill-none stroke-zinc-200"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className={cx('fill-none transition-all', toneMap[tone])}
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-sm font-semibold text-zinc-900">{Math.round(percent)}%</p>
        {label ? <p className="text-xs text-zinc-500">{label}</p> : null}
      </div>
    </div>
  )
}
