import type { GamificationObjectiveItem } from '@/features/student/gamification/hooks/useGamificationViewModel'
import { FqCard, FqProgressBar, FqTag, FqText } from '@/shared/ui'

type GamificationObjectivesCardProps = {
  items: GamificationObjectiveItem[]
  completedDailyMissions: number
  totalDailyMissions: number
  completedWeeklyMissions: number
  totalWeeklyMissions: number
}

export function GamificationObjectivesCard({
  items,
  completedDailyMissions,
  totalDailyMissions,
  completedWeeklyMissions,
  totalWeeklyMissions,
}: GamificationObjectivesCardProps) {
  return (
    <FqCard
      title="Proximos objetivos"
      subtitle="A area sempre deixa claro qual acao aproxima mais voce do proximo ganho."
      className="border-border bg-card"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <FqTag tone="primary">
            Diario {completedDailyMissions}/{totalDailyMissions}
          </FqTag>
          <FqTag tone="secondary">
            Semanal {completedWeeklyMissions}/{totalWeeklyMissions}
          </FqTag>
        </div>

        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-border/70 bg-muted/20 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <FqText as="p" className="text-sm font-semibold text-foreground">
                    {item.title}
                  </FqText>
                  <FqText as="p" className="text-xs text-muted-foreground">
                    {item.description}
                  </FqText>
                </div>
                <FqTag tone={item.tone}>{item.rewardLabel}</FqTag>
              </div>
              <div className="mt-3 space-y-2">
                <FqProgressBar value={item.progressPct} tone={item.tone === 'warning' ? 'warning' : item.tone} />
                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>{item.progressLabel}</span>
                  <span>{item.progressPct}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </FqCard>
  )
}
