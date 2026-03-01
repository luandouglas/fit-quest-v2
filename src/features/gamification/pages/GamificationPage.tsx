import { FqAchievementCard, FqAlert, FqButton, FqCalendarHeatmap, FqCard, FqEmptyState, FqLevelBadge, FqProgressBar, FqTag, FqText, FqXPBar } from '@/shared/ui'

import { useGamificationOverview } from '../hooks/useGamificationOverview'

export function GamificationPage() {
  const { overview, uiState, refresh, error } = useGamificationOverview()

  if (uiState === 'loading') {
    return (
      <section className="mx-auto w-full max-w-6xl space-y-4 px-4 py-4 lg:px-0">
        <FqCard className="border-border bg-card">
          <FqText as="h1" variant="title" className="text-lg">
            Carregando gamificacao...
          </FqText>
        </FqCard>
      </section>
    )
  }

  if (uiState === 'error') {
    return (
      <section className="mx-auto w-full max-w-6xl space-y-4 px-4 py-4 lg:px-0">
        <FqAlert tone="danger" title="Falha ao carregar gamificacao">
          {error instanceof Error ? error.message : 'Nao foi possivel carregar os dados agora.'}
        </FqAlert>
        <FqButton onClick={() => void refresh()} variant="outline" tone="neutral">
          Tentar novamente
        </FqButton>
      </section>
    )
  }

  if (uiState === 'empty' || !overview) {
    return (
      <section className="mx-auto w-full max-w-6xl space-y-4 px-4 py-4 lg:px-0">
        <FqEmptyState icon="gamepad" title="Sem dados de gamificacao" description="Conclua treinos para liberar XP, streak e badges." />
      </section>
    )
  }

  const weeklyXpPct = Math.round((overview.weeklyXp / Math.max(overview.weeklyXpTarget, 1)) * 100)

  return (
    <section className="mx-auto w-full max-w-6xl space-y-4 px-4 py-4 lg:px-0">
      <header className="space-y-2">
        <FqText as="h1" variant="title" className="text-lg">
          Gamificacao
        </FqText>
        <FqText as="p" className="text-sm text-muted-foreground">
          XP, nivel, streak semanal e conquistas para manter consistencia.
        </FqText>
      </header>

      <div className="grid gap-4 lg:grid-cols-12">
        <FqCard className="border-border bg-card lg:col-span-7">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <FqLevelBadge level={overview.level} label="Nivel" />
              <FqTag tone="primary">Streak semanal: {overview.weeklyStreak}</FqTag>
            </div>

            <FqXPBar currentXP={overview.currentLevelXp} targetXP={overview.nextLevelXp} label="XP do nivel atual" />

            <div className="rounded-xl border border-border bg-muted/20 p-3">
              <div className="flex items-center justify-between gap-2">
                <FqText as="p" className="text-sm font-semibold text-foreground">
                  XP da semana
                </FqText>
                <FqText as="p" className="text-xs text-muted-foreground">
                  {overview.weeklyXp}/{overview.weeklyXpTarget}
                </FqText>
              </div>
              <div className="mt-2">
                <FqProgressBar value={weeklyXpPct} tone={weeklyXpPct >= 100 ? 'success' : 'primary'} />
              </div>
            </div>
          </div>
        </FqCard>

        <FqCard className="border-border bg-card lg:col-span-5">
          <div className="space-y-3">
            <FqText as="h2" className="text-sm font-semibold text-foreground">
              Atividade dos ultimos 14 dias
            </FqText>
            <FqCalendarHeatmap data={overview.activityHeatmap} maxValue={3} className="border-border bg-card p-3" />
          </div>
        </FqCard>
      </div>

      <FqCard className="border-border bg-card">
        <div className="space-y-3">
          <FqText as="h2" className="text-sm font-semibold text-foreground">
            Badges basicas
          </FqText>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {overview.badges.map((badge) => (
              <FqAchievementCard
                key={badge.id}
                title={badge.title}
                description={badge.description}
                icon={badge.icon}
                unlocked={badge.unlocked}
                className="h-full border-border"
              />
            ))}
          </div>
        </div>
      </FqCard>
    </section>
  )
}
