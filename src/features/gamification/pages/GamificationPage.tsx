import { FqAchievementCard, FqAlert, FqButton, FqCalendarHeatmap, FqCard, FqEmptyState, FqLevelBadge, FqProgressBar, FqTag, FqText, FqTimeline, FqXPBar } from '@/shared/ui'

import { useGamificationOverview } from '../hooks/useGamificationOverview'

export function GamificationPage() {
  const { overview, uiState, refresh, error } = useGamificationOverview()

  if (uiState === 'loading') {
    return (
      <section className="fq-page-shell">
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
      <section className="fq-page-shell">
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
      <section className="fq-page-shell">
        <FqEmptyState icon="gamepad" title="Sem dados de gamificacao" description="Conclua treinos para liberar XP, streak e badges." />
      </section>
    )
  }

  const weeklyXpPct = Math.round((overview.weeklyXp / Math.max(overview.weeklyXpTarget, 1)) * 100)
  const completedMissions = overview.dailyMissions.filter((mission) => mission.completed).length
  const completedWeeklyMissions = overview.weeklyMissions.filter((mission) => mission.completed).length
  const missionGroups = [
    {
      title: 'Missoes diarias',
      subtitle: `Reset: ${new Date(overview.dailyResetAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}`,
      missions: overview.dailyMissions,
      progress: `${completedMissions}/${overview.dailyMissions.length}`,
    },
    {
      title: 'Missoes semanais',
      subtitle: `Reset: ${new Date(overview.weeklyResetAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}`,
      missions: overview.weeklyMissions,
      progress: `${completedWeeklyMissions}/${overview.weeklyMissions.length}`,
    },
  ] as const

  const achievementLabels = {
    WORKOUT: 'Treino',
    NUTRITION: 'Nutricao',
    HABIT: 'Habito',
    RUN: 'Corrida',
  } as const

  const ledgerTimeline = overview.xpLedger.slice(0, 12).map((entry) => {
    const tone =
      entry.eventType === 'mission'
        ? 'success'
        : entry.eventType === 'bonus'
          ? 'secondary'
          : entry.eventType === 'hydration'
            ? 'primary'
            : 'neutral'

    return {
      id: entry.id,
      title: `${entry.title} (+${entry.xp} XP)`,
      description: entry.description,
      time: new Date(entry.occurredAt).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      tone: tone as 'success' | 'secondary' | 'primary' | 'neutral',
    }
  })

  return (
    <section className="fq-page-shell">
      <header className="fq-page-header">
        <FqText as="h1" variant="title" className="text-lg">
          Gamificacao
        </FqText>
        <FqText as="p" className="text-sm text-muted-foreground">
          Missoes claras, recompensas transparentes e progressao baseada no que voce realmente conclui.
        </FqText>
      </header>

      <div className="grid gap-4 lg:grid-cols-12">
        <FqCard className="border-border bg-card lg:col-span-7">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <FqLevelBadge level={overview.level} label="Nivel" />
              <FqTag tone="primary">Streak semanal: {overview.weeklyStreak}</FqTag>
              <FqTag tone="secondary">XP total: {overview.totalXp}</FqTag>
            </div>

            <FqXPBar currentXP={overview.currentLevelXp} targetXP={overview.nextLevelXp} label="Progresso para o proximo nivel" />

            <div className="grid gap-2 sm:grid-cols-3">
              <FqCard className="border-border bg-muted/20">
                <FqText as="p" className="text-xs text-muted-foreground">XP hoje</FqText>
                <FqText as="p" className="text-base font-semibold text-foreground">{overview.todayXp}</FqText>
              </FqCard>
              <FqCard className="border-border bg-muted/20">
                <FqText as="p" className="text-xs text-muted-foreground">Missoes diarias</FqText>
                <FqText as="p" className="text-base font-semibold text-foreground">
                  {completedMissions}/{overview.dailyMissions.length}
                </FqText>
              </FqCard>
              <FqCard className="border-border bg-muted/20">
                <FqText as="p" className="text-xs text-muted-foreground">Missoes semanais</FqText>
                <FqText as="p" className="text-base font-semibold text-foreground">
                  {completedWeeklyMissions}/{overview.weeklyMissions.length}
                </FqText>
              </FqCard>
            </div>

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

            <div className="grid gap-2 sm:grid-cols-2">
              <FqCard className="border-border bg-muted/20">
                <FqText as="p" className="text-xs text-muted-foreground">XP treino</FqText>
                <FqText as="p" className="text-sm font-semibold text-foreground">{overview.xpBreakdown.workout}</FqText>
              </FqCard>
              <FqCard className="border-border bg-muted/20">
                <FqText as="p" className="text-xs text-muted-foreground">XP corrida</FqText>
                <FqText as="p" className="text-sm font-semibold text-foreground">{overview.xpBreakdown.run}</FqText>
              </FqCard>
              <FqCard className="border-border bg-muted/20">
                <FqText as="p" className="text-xs text-muted-foreground">XP refeicao</FqText>
                <FqText as="p" className="text-sm font-semibold text-foreground">{overview.xpBreakdown.nutrition}</FqText>
              </FqCard>
              <FqCard className="border-border bg-muted/20">
                <FqText as="p" className="text-xs text-muted-foreground">XP agua</FqText>
                <FqText as="p" className="text-sm font-semibold text-foreground">{overview.xpBreakdown.hydration}</FqText>
              </FqCard>
              <FqCard className="border-border bg-muted/20">
                <FqText as="p" className="text-xs text-muted-foreground">XP validacao profissional</FqText>
                <FqText as="p" className="text-sm font-semibold text-foreground">{overview.xpBreakdown.professional}</FqText>
              </FqCard>
              <FqCard className="border-border bg-muted/20">
                <FqText as="p" className="text-xs text-muted-foreground">XP missoes</FqText>
                <FqText as="p" className="text-sm font-semibold text-foreground">{overview.xpBreakdown.mission}</FqText>
              </FqCard>
            </div>
          </div>
        </FqCard>

        <FqCard className="border-border bg-card lg:col-span-5">
          <div className="space-y-3">
            <FqText as="h2" className="text-sm font-semibold text-foreground">
              Atividade dos ultimos 14 dias
            </FqText>
            <FqCalendarHeatmap data={overview.activityHeatmap} maxValue={4} className="border-border bg-card p-3" />
          </div>
        </FqCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {missionGroups.map((group) => (
          <FqCard key={group.title} className="border-border bg-card">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="space-y-1">
                  <FqText as="h2" className="text-sm font-semibold text-foreground">
                    {group.title}
                  </FqText>
                  <FqText as="p" className="text-xs text-muted-foreground">
                    {group.subtitle}
                  </FqText>
                </div>
                <FqTag tone="secondary">{group.progress}</FqTag>
              </div>
              <div className="space-y-3">
                {group.missions.map((mission) => {
                  const progressPct = Math.round((mission.current / Math.max(mission.target, 1)) * 100)
                  return (
                    <FqCard key={mission.id} className="border-border bg-muted/20">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <FqText as="p" className="text-sm font-semibold text-foreground">
                            {mission.title}
                          </FqText>
                          <FqTag tone={mission.completed ? 'success' : 'warning'}>{mission.rewardXp} XP</FqTag>
                        </div>
                        <FqText as="p" className="text-xs text-muted-foreground">{mission.description}</FqText>
                        <FqProgressBar value={Math.min(progressPct, 100)} tone={mission.completed ? 'success' : 'primary'} />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            {mission.current}/{mission.target}
                          </span>
                          <span>{mission.rewardBadgeId ? `Badge: ${mission.rewardBadgeId}` : 'Recompensa XP'}</span>
                        </div>
                      </div>
                    </FqCard>
                  )
                })}
              </div>
            </div>
          </FqCard>
        ))}
      </div>

      <FqCard className="border-border bg-card">
        <div className="space-y-3">
          <FqText as="h2" className="text-sm font-semibold text-foreground">
            Conquistas por categoria
          </FqText>
          <div className="space-y-4">
            {Object.entries(overview.achievementsByCategory).map(([category, achievements]) => (
              <div key={category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <FqText as="p" className="text-sm font-semibold text-foreground">
                    {achievementLabels[category as keyof typeof achievementLabels]}
                  </FqText>
                  <FqTag tone="secondary">
                    {achievements.filter((achievement) => achievement.unlocked).length}/{achievements.length}
                  </FqTag>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {achievements.map((badge) => (
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
            ))}
          </div>
        </div>
      </FqCard>

      <FqCard className="border-border bg-card">
        <div className="space-y-3">
          <FqText as="h2" className="text-sm font-semibold text-foreground">
            XP Ledger
          </FqText>
          <FqText as="p" className="text-xs text-muted-foreground">
            Transparencia total: cada evento mostra quando o XP entrou e por qual regra.
          </FqText>
          <FqTimeline items={ledgerTimeline} />
        </div>
      </FqCard>
    </section>
  )
}
