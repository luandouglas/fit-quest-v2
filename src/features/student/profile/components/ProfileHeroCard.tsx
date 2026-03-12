import { FqAvatar, FqCard, FqLevelBadge, FqStatCard, FqTag, FqText } from '@/shared/ui'

type ProfileHeroCardProps = {
  name: string
  avatarUrl?: string
  goalLabel: string
  headline: string
  level: number
  stars: number
  streakDays: number
}

export function ProfileHeroCard({
  name,
  avatarUrl,
  goalLabel,
  headline,
  level,
  stars,
  streakDays,
}: ProfileHeroCardProps) {
  return (
    <FqCard className="fq-gradient-profile-hero overflow-hidden border-border">
      <div className="space-y-5">
        <div className="flex items-start gap-4">
          <FqAvatar name={name} src={avatarUrl} size="lg" className="h-16 w-16 bg-secondary/15 text-secondary" />
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <FqLevelBadge level={level} label="Nivel" />
              <FqTag tone="secondary" leftIcon="star">{stars} estrelas</FqTag>
              <FqTag tone="warning" leftIcon="flame">{streakDays} dias</FqTag>
            </div>
            <div>
              <FqText as="h2" variant="title" className="text-2xl">
                {name}
              </FqText>
              <FqText as="p" className="text-sm text-muted-foreground">
                {headline}
              </FqText>
            </div>
          </div>
        </div>

        <div className="rounded-[calc(var(--radius)+4px)] border border-border/75 bg-background/75 p-4">
          <FqText as="p" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Objetivo atual
          </FqText>
          <FqText as="p" className="mt-2 text-lg font-semibold text-foreground">
            {goalLabel}
          </FqText>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <FqStatCard label="Estrelas totais" value={stars} icon="star" />
          <FqStatCard label="Streak atual" value={`${streakDays} dias`} icon="flame" />
          <FqStatCard label="Nivel" value={level} helperText="Ligado a constancia e execucao" icon="target" />
        </div>
      </div>
    </FqCard>
  )
}
