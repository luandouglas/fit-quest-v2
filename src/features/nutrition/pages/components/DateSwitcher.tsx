import { useMemo } from 'react'

import { FqButton, FqCard, FqIcon, FqText } from '@/shared/ui'

type DateSwitcherProps = {
  selectedDate: string
  todayDate: string
  yesterdayDate: string
  tomorrowDate: string
  onSelectDate: (date: string) => void
  onOpenCalendar: () => void
  isLoading?: boolean
}

function formatDateLabel(date: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  }).format(new Date(`${date}T12:00:00`))
}

export function DateSwitcher({
  selectedDate,
  todayDate,
  yesterdayDate,
  tomorrowDate,
  onSelectDate,
  onOpenCalendar,
  isLoading = false,
}: DateSwitcherProps) {
  const options = [
    { label: 'Ontem', date: yesterdayDate },
    { label: 'Hoje', date: todayDate },
    { label: 'Amanha', date: tomorrowDate },
  ]

  const selectedDateLabel = useMemo(() => formatDateLabel(selectedDate), [selectedDate])

  return (
    <FqCard className="border-border bg-card">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <FqText as="p" className="text-sm font-medium capitalize text-muted-foreground">
            {selectedDateLabel}
          </FqText>

          <FqButton
            variant="outline"
            tone="secondary"
            leftIcon="calendar"
            onClick={onOpenCalendar}
            isDisabled={isLoading}
          >
            Calendario
          </FqButton>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {options.map((option) => {
            const isActive = option.date === selectedDate

            return (
              <FqButton
                key={option.date}
                size="md"
                tone={isActive ? 'primary' : 'neutral'}
                variant={isActive ? 'solid' : 'outline'}
                onClick={() => onSelectDate(option.date)}
                isDisabled={isLoading}
                className="w-full"
              >
                {option.label}
              </FqButton>
            )
          })}
        </div>

        <p className="inline-flex items-center gap-2 text-xs text-muted-foreground">
          <FqIcon name="info" size={12} />
          Altere o dia para visualizar refeicoes, macros e hidratacao.
        </p>
      </div>
    </FqCard>
  )
}
