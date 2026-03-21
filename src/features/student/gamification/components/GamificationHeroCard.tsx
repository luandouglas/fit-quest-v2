import { FqCard, FqLevelBadge, FqStatCard, FqTag, FqText, FqXPBar } from '@/shared/ui'

type GamificationHeroCardProps = {
  stars: number
  level: number
  streakDays: number
  weeklyStreak: number
  currentLevelXp: number
  nextLevelXp: number
  nextLevelRemaining: number
  todayXp: number
  weeklyXp: number
  weeklyXpTarget: number
  trendLabel: string
  feedback: string[]
}

export function GamificationHeroCard({
  stars,
  level,
  streakDays,
  weeklyStreak,
  currentLevelXp,
  nextLevelXp,
  nextLevelRemaining,
  todayXp,
  weeklyXp,
  weeklyXpTarget,
  trendLabel,
  feedback,
}: GamificationHeroCardProps) {
  return (
    <FqCard className="fq-gradient-gamification-hero overflow-hidden border-border">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <FqLevelBadge level={level} label="Nivel" />
          <FqTag tone="secondary" leftIcon="star">{stars} estrelas</FqTag>
          <FqTag tone="warning" leftIcon="flame">{streakDays} dias de streak</FqTag>
        </div>

        <div className="space-y-2">
          <FqText as="h2" variant="title" className="text-section-title">
            Seu progresso precisa sempre apontar para a proxima meta.
          </FqText>
          <FqText as="p" className="max-w-2xl text-sm text-muted-foreground">
            Estrelas mostram aderencia diaria. Nivel e XP mostram consistencia acumulada. Ranking e conquistas mostram impacto real.
          </FqText>
        </div>

        <FqXPBar
          currentXP={currentLevelXp}
          targetXP={nextLevelXp}
          label={nextLevelRemaining > 0 ? `Faltam ${nextLevelRemaining} XP para o proximo nivel` : 'Proximo nivel liberado'}
        />

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <FqStatCard label="Estrelas acumuladas" value={stars} helperText="Moeda principal do aluno" icon="star" />
          <FqStatCard label="XP de hoje" value={todayXp} helperText="Progresso gerado no dia" icon="target" />
          <FqStatCard
            label="Streak ativo"
            value={`${streakDays} dias`}
            helperText={`Consistencia semanal: ${weeklyStreak}`}
            icon="flame"
          />
          <FqStatCard
            label="Leitura de momento"
            value={trendLabel}
            helperText={`${weeklyXp}/${weeklyXpTarget} XP na semana`}
            icon="chart"
          />
        </div>

        {feedback.length > 0 ? (
          <div className="grid gap-2 md:grid-cols-2">
            {feedback.map((item) => (
              <div
                key={item}
                className="rounded-xl border border-border/80 bg-background/70 px-4 py-3"
              >
                <FqText as="p" className="text-sm text-foreground">
                  {item}
                </FqText>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </FqCard>
  )
}
