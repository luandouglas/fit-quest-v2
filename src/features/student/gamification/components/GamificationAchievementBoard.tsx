import type { GamificationAchievementCardItem } from '@/features/student/gamification/hooks/useGamificationViewModel'
import { FqAchievementCard, FqCard, FqProgressBar, FqTag, FqText } from '@/shared/ui'

type GamificationAchievementBoardProps = {
  unlocked: GamificationAchievementCardItem[]
  upcoming: GamificationAchievementCardItem[]
}

function AchievementGroup({
  title,
  subtitle,
  items,
}: {
  title: string
  subtitle: string
  items: GamificationAchievementCardItem[]
}) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <FqText as="h3" className="text-sm font-semibold text-foreground">
          {title}
        </FqText>
        <FqText as="p" className="text-xs text-muted-foreground">
          {subtitle}
        </FqText>
      </div>

      {items.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="space-y-2 rounded-[calc(var(--radius)+4px)] border border-border/70 bg-muted/10 p-2"
            >
              <FqAchievementCard
                title={item.title}
                description={item.description}
                icon={item.icon}
                unlocked={item.unlocked}
                className="h-full border-0 bg-transparent p-2 shadow-none"
              />
              {!item.unlocked ? (
                <div className="space-y-2 px-2 pb-2">
                  <FqProgressBar value={item.progressPct} tone="primary" />
                  <div className="flex items-center justify-between gap-2">
                    <FqText as="p" className="text-xs text-muted-foreground">
                      {item.progressLabel}
                    </FqText>
                    {item.rewardLabel ? <FqTag tone="secondary">{item.rewardLabel}</FqTag> : null}
                  </div>
                </div>
              ) : (
                <div className="px-2 pb-2">
                  {item.rewardLabel ? <FqTag tone="success">{item.rewardLabel}</FqTag> : null}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-[calc(var(--radius)+4px)] border border-dashed border-border/80 bg-muted/10 p-4">
          <FqText as="p" className="text-sm text-muted-foreground">
            Sem dados suficientes para essa faixa de conquistas ainda.
          </FqText>
        </div>
      )}
    </div>
  )
}

export function GamificationAchievementBoard({
  unlocked,
  upcoming,
}: GamificationAchievementBoardProps) {
  return (
    <FqCard
      title="Conquistas"
      subtitle="O aluno sempre enxerga o que ja desbloqueou e o que esta mais proximo de liberar."
      className="border-border bg-card"
    >
      <div className="space-y-6">
        <AchievementGroup
          title="Ja desbloqueadas"
          subtitle="Marcos que reforcam consistencia e execucao real."
          items={unlocked}
        />
        <AchievementGroup
          title="Quase la"
          subtitle="Proximos alvos que valem retorno diario."
          items={upcoming}
        />
      </div>
    </FqCard>
  )
}
