import { FqButton, FqCard, FqProgressBar, FqTag, FqText } from '@/shared/ui'

type DesktopSummaryPanelProps = {
  progressPct: number
  stars: number
  totalDurationMin: number
  isStarted: boolean
  onStart: () => void
}

export function DesktopSummaryPanel({
  progressPct,
  stars,
  totalDurationMin,
  isStarted,
  onStart,
}: DesktopSummaryPanelProps) {
  return (
    <aside className="space-y-4 xl:sticky xl:top-5 xl:h-fit">
      <FqCard className="border-border bg-card">
        <div className="space-y-4">
          <FqText as="p" className="text-sm text-muted-foreground">
            Resumo do treino
          </FqText>

          <FqProgressBar value={progressPct} tone="primary" showLabel />

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-accent p-3 text-center">
              <p className="text-lg font-semibold text-foreground">{stars}</p>
              <p className="text-xs text-muted-foreground">Estrelas</p>
            </div>
            <div className="rounded-xl bg-accent p-3 text-center">
              <p className="text-lg font-semibold text-foreground">{totalDurationMin}</p>
              <p className="text-xs text-muted-foreground">Minutos</p>
            </div>
          </div>

          <FqButton className="w-full" leftIcon="play" onClick={onStart}>
            {isStarted ? 'Retomar treino' : 'Iniciar treino'}
          </FqButton>

          <FqTag tone="secondary" className="w-full justify-center rounded-lg py-2 text-sm">
            Você está mais perto da sua meta hoje
          </FqTag>
        </div>
      </FqCard>
    </aside>
  )
}
