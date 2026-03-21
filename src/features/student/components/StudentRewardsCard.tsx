import { FqAchievementCard, FqButton, FqCard, FqLevelBadge, FqTag, FqText, FqXPBar } from '@/shared/ui'
import type { Achievement, GamificationProfile } from '@/shared/services/contracts/student'

type StudentRewardsCardProps = {
  gamificationProfile: GamificationProfile
  achievements: Achievement[]
  onOpenRewards: () => void
}

export function StudentRewardsCard({
  gamificationProfile,
  achievements,
  onOpenRewards,
}: StudentRewardsCardProps) {
  return (
    <FqCard className="border-border bg-card">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <FqText as="h2" className="text-sm font-semibold text-foreground">
              Gamificação e recompensas
            </FqText>
            <FqText as="p" className="text-sm text-muted-foreground">
              Estrelas, nível, streak e conquistas destravadas.
            </FqText>
          </div>
          <FqLevelBadge level={gamificationProfile.level} label="Level" />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-muted/10 p-4">
            <FqText as="p" className="text-sm font-semibold text-foreground">
              Progressão
            </FqText>
            <div className="mt-3">
              <FqXPBar
                currentXP={gamificationProfile.currentLevelXp}
                targetXP={gamificationProfile.nextLevelXp}
                label="XP do nível atual"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-muted/10 p-4">
            <FqText as="p" className="text-sm font-semibold text-foreground">
              Ritmo da semana
            </FqText>
            <div className="mt-3 space-y-2">
              <FqTag tone="warning" leftIcon="flame">
                {gamificationProfile.streakDays} dias de streak
              </FqTag>
              <FqTag tone="secondary" leftIcon="star">
                {gamificationProfile.stars} estrelas acumuladas
              </FqTag>
              <FqText as="p" className="text-xs text-muted-foreground">
                {gamificationProfile.weeklyXp}/{gamificationProfile.weeklyXpTarget} XP na semana
              </FqText>
            </div>
          </div>
        </div>

        <div className="grid gap-3">
          {achievements.slice(0, 3).map((achievement) => (
            <FqAchievementCard
              key={achievement.id}
              title={achievement.title}
              description={achievement.description}
              icon={achievement.icon}
              unlocked={achievement.status === 'unlocked'}
            />
          ))}
        </div>

        <FqButton variant="outline" tone="neutral" leftIcon="trophy" onClick={onOpenRewards}>
          Abrir central de recompensas
        </FqButton>
      </div>
    </FqCard>
  )
}
