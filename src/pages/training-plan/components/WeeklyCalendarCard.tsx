import { FqCard, FqIcon, FqText } from '@/shared/ui'
import { cx } from '@/shared/utils'

import type { TrainingPlanDay } from '../types'

type WeeklyCalendarCardProps = {
  days: TrainingPlanDay[]
}

const stateClassMap = {
  completed: 'bg-success text-success-foreground border-success',
  today: 'bg-secondary text-secondary-foreground border-secondary',
  upcoming: 'bg-accent text-accent-foreground border-border',
} as const

function getState(day: TrainingPlanDay) {
  if (day.isCompleted) return 'completed'
  if (day.isToday) return 'today'
  return 'upcoming'
}

export function WeeklyCalendarCard({ days }: WeeklyCalendarCardProps) {
  return (
    <FqCard className="border-border bg-card">
      <div className="space-y-3">
        <FqText as="p" className="text-sm text-muted-foreground">
          Esta semana
        </FqText>

        <div className="overflow-x-auto scrollbar-hide">
          <div className="grid min-w-[360px] grid-cols-7 gap-2">
            {days.map((day) => {
              const state = getState(day)

              return (
                <div key={day.date} className="text-center">
                  <p className="mb-1 text-xs font-medium text-muted-foreground">{day.weekday}</p>
                  <span
                    className={cx(
                      'mx-auto inline-flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold',
                      stateClassMap[state],
                    )}
                    aria-current={day.isToday ? 'date' : undefined}
                  >
                    {day.isCompleted ? <FqIcon name="check" size={12} /> : day.hasWorkout ? day.date.slice(-2) : '-'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </FqCard>
  )
}
