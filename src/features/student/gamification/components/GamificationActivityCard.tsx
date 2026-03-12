import type { GamificationHeatmapPoint } from '@/shared/services/contracts/gamification'
import type { FqTimelineItem } from '@/shared/ui'
import { FqCalendarHeatmap, FqCard, FqText, FqTimeline } from '@/shared/ui'

type GamificationActivityCardProps = {
  heatmap: GamificationHeatmapPoint[]
  timeline: FqTimelineItem[]
}

export function GamificationActivityCard({
  heatmap,
  timeline,
}: GamificationActivityCardProps) {
  return (
    <FqCard
      title="Ritmo recente"
      subtitle="Leitura curta do que gerou progresso nos ultimos dias."
      className="border-border bg-card"
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="space-y-3">
          <FqText as="p" className="text-sm font-semibold text-foreground">
            Ultimos 14 dias
          </FqText>
          <FqCalendarHeatmap data={heatmap} maxValue={4} className="border-border bg-card" />
        </div>

        <div className="space-y-3">
          <FqText as="p" className="text-sm font-semibold text-foreground">
            Feed de ganhos
          </FqText>
          <FqTimeline items={timeline} className="border-border bg-card" />
        </div>
      </div>
    </FqCard>
  )
}
