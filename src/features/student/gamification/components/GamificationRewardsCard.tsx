import type { GamificationRewardItem } from '@/features/student/gamification/hooks/useGamificationViewModel'
import { FqCard, FqTag, FqText } from '@/shared/ui'

type GamificationRewardsCardProps = {
  earned: GamificationRewardItem[]
  next: GamificationRewardItem[]
}

function RewardGroup({
  title,
  tone,
  items,
}: {
  title: string
  tone: 'success' | 'secondary'
  items: GamificationRewardItem[]
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <FqText as="h3" className="text-sm font-semibold text-foreground">
          {title}
        </FqText>
        <FqTag tone={tone}>{items.length}</FqTag>
      </div>

      <div className="space-y-2">
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
              <FqTag tone={item.status === 'earned' ? 'success' : 'secondary'}>
                {item.status === 'earned' ? 'Conquistado' : 'Proximo'}
              </FqTag>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function GamificationRewardsCard({
  earned,
  next,
}: GamificationRewardsCardProps) {
  return (
    <FqCard
      title="Recompensas simbolicas"
      subtitle="Sem infantilizar: a recompensa comunica valor, recorrencia e status."
      className="border-border bg-card"
    >
      <div className="space-y-5">
        <RewardGroup title="Ja convertidas" tone="success" items={earned} />
        <RewardGroup title="Em foco" tone="secondary" items={next} />
      </div>
    </FqCard>
  )
}
