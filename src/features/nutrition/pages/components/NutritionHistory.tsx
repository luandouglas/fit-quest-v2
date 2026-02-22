import { FqCard, FqIcon, FqTag } from '@/shared/ui'
import { cx } from '@/shared/utils'

import type { NutritionHistoryDay } from '../NutritionPage'

type NutritionHistoryProps = {
  days: NutritionHistoryDay[]
  selectedDate: string
  onOpenDay: (date: string) => void
}

function formatHistoryDate(date: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  }).format(new Date(`${date}T12:00:00`))
}

export function NutritionHistory({ days, selectedDate, onOpenDay }: NutritionHistoryProps) {
  return (
    <FqCard className="border-border bg-card">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-lg font-semibold text-foreground">Historico (7 dias)</h3>
          <p className="text-sm text-muted-foreground">Ultimos registros</p>
        </div>

        <div className="space-y-2">
          {days.map((day) => {
            const isSelected = day.date === selectedDate

            return (
              <button
                type="button"
                key={day.date}
                onClick={() => onOpenDay(day.date)}
                className={cx(
                  'flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  isSelected
                    ? 'border-secondary/40 bg-secondary/10'
                    : 'border-border bg-background hover:bg-accent',
                )}
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold capitalize text-foreground">{formatHistoryDate(day.date)}</p>
                  <p className="text-xs text-muted-foreground">
                    {day.mealsDonePct}% refeicoes | {day.calories} kcal | {day.waterMl} ml agua
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <FqTag
                    tone={day.status === 'ok' ? 'success' : 'warning'}
                    className="rounded-lg px-2 py-1 text-[11px] normal-case tracking-normal"
                  >
                    {day.status === 'ok' ? 'Ok' : 'Pendente'}
                  </FqTag>
                  <FqIcon name="chevronRight" size={14} className="text-muted-foreground" ariaLabel="Abrir dia" />
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </FqCard>
  )
}
