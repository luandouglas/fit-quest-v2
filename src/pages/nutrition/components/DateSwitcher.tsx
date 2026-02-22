import { FqButton, FqChip, FqIcon } from '@/shared/ui'

type DateSwitcherProps = {
  selectedDateLabel: string
  selectedPreset: 'yesterday' | 'today' | 'tomorrow' | null
  onPresetChange: (preset: 'yesterday' | 'today' | 'tomorrow') => void
  onOpenCalendar: () => void
}

export function DateSwitcher({
  selectedDateLabel,
  selectedPreset,
  onPresetChange,
  onOpenCalendar,
}: DateSwitcherProps) {
  return (
    <div className="sticky top-[4.6rem] z-20 space-y-3 rounded-xl border border-border bg-background/95 p-3 backdrop-blur lg:static lg:bg-transparent lg:p-0">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Plano do dia</p>
          <p className="text-base font-semibold text-foreground">{selectedDateLabel}</p>
        </div>

        <FqButton
          variant="outline"
          tone="secondary"
          size="md"
          leftIcon="calendar"
          onClick={onOpenCalendar}
          aria-label="Abrir seletor de data"
          className="min-h-11"
        >
          Calendario
        </FqButton>
      </div>

      <div className="grid grid-cols-3 gap-2 rounded-xl bg-muted p-1">
        <FqChip
          selected={selectedPreset === 'yesterday'}
          onSelectedChange={() => onPresetChange('yesterday')}
          className="justify-center rounded-lg border-0 px-3 py-2 text-sm"
          aria-label="Visualizar plano de ontem"
        >
          Ontem
        </FqChip>
        <FqChip
          selected={selectedPreset === 'today'}
          onSelectedChange={() => onPresetChange('today')}
          className="justify-center rounded-lg border-0 px-3 py-2 text-sm"
          aria-label="Visualizar plano de hoje"
        >
          Hoje
        </FqChip>
        <FqChip
          selected={selectedPreset === 'tomorrow'}
          onSelectedChange={() => onPresetChange('tomorrow')}
          className="justify-center rounded-lg border-0 px-3 py-2 text-sm"
          aria-label="Visualizar plano de amanha"
        >
          Amanha
        </FqChip>
      </div>

      <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <FqIcon name="clock" size={14} ariaLabel="Horario" />
        Horarios e porcoes definidos pelo nutricionista
      </p>
    </div>
  )
}
