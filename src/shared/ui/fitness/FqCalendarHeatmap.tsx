import type { HTMLAttributes } from 'react'

import { clamp, cx } from '@/shared/utils'
import type { FqBaseProps } from '@/shared/ui/types'

export type FqCalendarHeatmapPoint = {
  date: string
  value: number
}

type FqCalendarHeatmapProps = FqBaseProps &
  Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'className'> & {
    data: FqCalendarHeatmapPoint[]
    maxValue?: number
  }

function getShadeClass(value: number, maxValue: number) {
  const percent = clamp((value / Math.max(maxValue, 1)) * 100, 0, 100)

  if (percent >= 80) {
    return 'bg-emerald-600'
  }

  if (percent >= 60) {
    return 'bg-emerald-500'
  }

  if (percent >= 40) {
    return 'bg-emerald-400'
  }

  if (percent >= 20) {
    return 'bg-emerald-300'
  }

  return 'bg-zinc-200'
}

export function FqCalendarHeatmap({
  data,
  maxValue = 8,
  className,
  
  testId,
  ...rest
}: FqCalendarHeatmapProps) {
  return (
    <div
      className={cx('w-full space-y-2 rounded-lg border border-zinc-200 bg-white p-4', className)}
     
      data-testid={testId}
      {...rest}
    >
      <div className="grid grid-cols-14 gap-1">
        {data.map((point) => (
          <div
            key={point.date}
            className={cx('h-4 w-4 rounded-sm', getShadeClass(point.value, maxValue))}
            title={`${point.date}: ${point.value}`}
            aria-label={`${point.date}: ${point.value}`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>Menos</span>
        <div className="flex items-center gap-1">
          <span className="h-3 w-3 rounded-sm bg-zinc-200" />
          <span className="h-3 w-3 rounded-sm bg-emerald-300" />
          <span className="h-3 w-3 rounded-sm bg-emerald-500" />
          <span className="h-3 w-3 rounded-sm bg-emerald-600" />
        </div>
        <span>Mais</span>
      </div>
    </div>
  )
}
