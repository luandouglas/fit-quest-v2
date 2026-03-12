import type { Achievement } from '@/shared/services/contracts/student'
import { FqAchievementCard, FqCard, FqTag, FqText } from '@/shared/ui'

type ProfileAchievementsCardProps = {
  achievements: Achievement[]
}

export function ProfileAchievementsCard({ achievements }: ProfileAchievementsCardProps) {
  return (
    <FqCard
      title="Conquistas em destaque"
      subtitle="O perfil reforca marcos ja desbloqueados e o que esta perto de virar conquista."
      className="border-border bg-card"
    >
      {achievements.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {achievements.map((achievement) => (
            <div key={achievement.id} className="space-y-2 rounded-[calc(var(--radius)+4px)] border border-border/75 bg-muted/10 p-2">
              <FqAchievementCard
                title={achievement.title}
                description={achievement.description}
                icon={achievement.icon}
                unlocked={achievement.status === 'unlocked'}
                className="h-full border-0 bg-transparent p-2 shadow-none"
              />
              <div className="flex items-center justify-between gap-2 px-2 pb-2">
                <FqText as="p" className="text-xs text-muted-foreground">
                  {achievement.status === 'unlocked'
                    ? 'Conquista ativa no perfil'
                    : `${achievement.currentProgress}/${achievement.targetProgress}`}
                </FqText>
                <FqTag tone={achievement.status === 'unlocked' ? 'success' : 'secondary'}>
                  {achievement.rewardStars} estrelas
                </FqTag>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-[calc(var(--radius)+4px)] border border-dashed border-border/80 bg-muted/10 p-4">
          <FqText as="p" className="text-sm text-muted-foreground">
            Suas conquistas vao aparecer aqui conforme treino, cardio, agua e nutricao forem sendo concluídos.
          </FqText>
        </div>
      )}
    </FqCard>
  )
}
