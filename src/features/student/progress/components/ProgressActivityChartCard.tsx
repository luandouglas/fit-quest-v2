import type { ProgressChartPoint } from '@/shared/services/contracts/progress'
import { FqCard, FqText } from '@/shared/ui'

type ProgressActivityPoint = ProgressChartPoint & {
  durationPct: number
  label: string
}

type ProgressActivityChartCardProps = {
  points: ProgressActivityPoint[]
  weightHistory: Array<{ id: string; date: string; weightKg: number }>
}

export function ProgressActivityChartCard({
  points,
  weightHistory,
}: ProgressActivityChartCardProps) {
  return (
    <FqCard
      title="Evolucao visual"
      subtitle="Ritmo diario de atividade e leitura recente de peso."
      className="border-border bg-card"
    >
      <div className="space-y-6">
        <div className="space-y-3">
          <FqText as="p" className="text-sm font-semibold text-foreground">
            Ultimos 14 dias de atividade
          </FqText>
          <div className="grid h-44 grid-cols-7 gap-2 sm:grid-cols-14">
            {points.map((point) => (
              <div key={point.date} className="flex flex-col justify-end gap-2">
                <div className="flex-1 rounded-full bg-muted/40 p-1">
                  <div
                    className="w-full rounded-full bg-secondary transition-height duration-300"
                    style={{ height: `${point.durationPct}%` }}
                  />
                </div>
                <div className="text-center">
                  <FqText as="p" className="text-2xs font-medium text-foreground">
                    {point.label}
                  </FqText>
                  <FqText as="p" className="text-2xs text-muted-foreground">
                    {point.durationMin} min
                  </FqText>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <FqText as="p" className="text-sm font-semibold text-foreground">
            Peso recente
          </FqText>
          <div className="grid gap-2 sm:grid-cols-2">
            {weightHistory.slice(-6).map((entry) => (
              <div
                key={entry.id}
                className="rounded-xl border border-border/70 bg-muted/20 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <FqText as="p" className="text-sm font-semibold text-foreground">
                    {entry.weightKg.toFixed(1)} kg
                  </FqText>
                  <FqText as="p" className="text-xs text-muted-foreground">
                    {new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(
                      new Date(`${entry.date}T00:00:00`),
                    )}
                  </FqText>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </FqCard>
  )
}
