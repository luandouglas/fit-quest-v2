import { FqCard, FqIcon, FqText } from '@/shared/ui'
import { cx } from '@/shared/utils'

import type { TrainingPlanDay } from '../types'

type WeeklyCalendarCardProps = {
  days: TrainingPlanDay[]
  selectedDate: string | null
  onSelectDate: (date: string) => void
}

const stateClassMap = {
  completed: 'bg-success text-success-foreground border-success',
  pending: 'bg-secondary text-secondary-foreground border-secondary',
  late: 'bg-destructive/15 text-destructive border-destructive/40',
  rest: 'bg-accent text-accent-foreground border-border',
} as const

function getState(day: TrainingPlanDay) {
  return day.status
}

export function WeeklyCalendarCard({ days, selectedDate, onSelectDate }: WeeklyCalendarCardProps) {
  return (
    <FqCard className="border-border bg-card">
      <div className="space-y-3">
        <FqText as="p" className="text-sm text-muted-foreground">
          Esta semana
        </FqText>

        <div className="overflow-x-auto scrollbar-hide px-1">
          <div className="grid min-w-[360px] grid-cols-7 gap-2 pr-1">
            {days.map((day) => {
              const state = getState(day)
              const isSelected = selectedDate === day.date

              return (
                <button
                  type="button"
                  key={day.date}
                  className="text-center"
                  onClick={() => onSelectDate(day.date)}
                  aria-current={day.isToday ? 'date' : undefined}
                >
                  <p className="mb-1 text-xs font-medium text-muted-foreground">{day.weekday}</p>
                  <span
                    className={cx(
                      'mx-auto inline-flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold',
                      stateClassMap[state],
                      isSelected ? 'border-2 border-ring' : '',
                    )}
                  >
                    {day.status === 'completed' ? (
                      <FqIcon name="check" size={12} />
                    ) : day.hasWorkout ? (
                      day.date.slice(-2)
                    ) : (
                      '-'
                    )}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </FqCard>
  )
}
