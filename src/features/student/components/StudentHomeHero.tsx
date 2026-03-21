import { FqCard, FqGoalRing, FqLevelBadge, FqTag, FqText, FqXPBar } from '@/shared/ui'
import type { StudentDashboard } from '@/shared/services/contracts/student'

import type { StudentHomeViewModel } from '../hooks/useStudentHomeViewModel'

type StudentHomeHeroProps = {
  dashboard: StudentDashboard
  viewModel: StudentHomeViewModel
}

export function StudentHomeHero({ dashboard, viewModel }: StudentHomeHeroProps) {
  return (
    <FqCard className="fq-fitness-glow overflow-hidden border-border/80 bg-card/95">
      <div className="grid gap-6 xl:fq-grid-main-fixed-18">
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <FqTag tone="primary">{viewModel.salutation}</FqTag>
              <FqTag tone="warning" leftIcon="flame">
                {dashboard.gamificationProfile.streakDays} dias de streak
              </FqTag>
              <FqTag tone="secondary">{dashboard.profile.primaryGoal}</FqTag>
            </div>

            <div className="space-y-2">
              <FqText as="p" className="fq-subtle-label">
                Visão principal do dia
              </FqText>
              <FqText as="h1" className="fq-display text-screen-title leading-none text-foreground">
                Clareza para agir hoje. Progresso para voltar amanhã.
              </FqText>
              <FqText as="p" className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-body">
                {dashboard.dailyProgress.focusLabel}. Você já acumulou {dashboard.dailyProgress.xpEarned} XP,
                ganhou {dashboard.dailyProgress.starsEarned} estrelas e está a {viewModel.nextLevelXpRemaining} XP
                do próximo nível.
              </FqText>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="fq-soft-block px-4 py-4 shadow-elevated">
              <FqText as="p" className="fq-subtle-label">
                Ritmo do dia
              </FqText>
              <FqText as="p" className="mt-2 text-card-title font-semibold tracking-tight text-foreground">
                {dashboard.dailyProgress.completionPct}%
              </FqText>
              <FqText as="p" className="mt-1 text-xs text-muted-foreground">
                {dashboard.dailyProgress.completedBlocks}/{dashboard.dailyProgress.totalBlocks} blocos concluídos
              </FqText>
            </div>
            <div className="fq-soft-block px-4 py-4 shadow-elevated">
              <FqText as="p" className="fq-subtle-label">
                Pendências
              </FqText>
              <FqText as="p" className="mt-2 text-card-title font-semibold tracking-tight text-foreground">
                {viewModel.pendingActionsCount}
              </FqText>
              <FqText as="p" className="mt-1 text-xs text-muted-foreground">
                Ações restantes para fechar o dia.
              </FqText>
            </div>
            <div className="fq-soft-block px-4 py-4 shadow-elevated">
              <FqText as="p" className="fq-subtle-label">
                Consistência
              </FqText>
              <FqText as="p" className="mt-2 text-card-title font-semibold tracking-tight text-foreground">
                {dashboard.gamificationProfile.streakDays} dias
              </FqText>
              <FqText as="p" className="mt-1 text-xs text-muted-foreground">
                Sequência ativa com foco em pequenos passos diários.
              </FqText>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-border/70 bg-background/70 p-4 shadow-inset-highlight">
            <div className="flex items-center justify-between gap-3">
              <div>
                <FqText as="p" className="text-sm font-semibold text-foreground">
                  Progresso para o próximo nível
                </FqText>
                <FqText as="p" className="text-xs text-muted-foreground">
                  Faltam {viewModel.nextLevelXpRemaining} XP para destravar o próximo nível.
                </FqText>
              </div>
              <FqLevelBadge level={dashboard.gamificationProfile.level} label="Level" />
            </div>
            <FqXPBar
              currentXP={dashboard.gamificationProfile.currentLevelXp}
              targetXP={dashboard.gamificationProfile.nextLevelXp}
              label="XP do nível atual"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <FqGoalRing
            value={dashboard.dailyProgress.completedBlocks}
            max={dashboard.dailyProgress.totalBlocks}
            tone={dashboard.dailyProgress.status === 'completed' ? 'success' : 'primary'}
            title="Checklist diário"
            subtitle={`${dashboard.dailyProgress.completedBlocks}/${dashboard.dailyProgress.totalBlocks} blocos concluídos`}
            size={112}
            className="bg-background/70"
          />
          <div className="rounded-xl border border-border/70 bg-background/70 p-4 shadow-float">
            <FqText as="p" className="fq-subtle-label">
              Semana em resumo
            </FqText>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <FqText as="p" className="text-sm text-muted-foreground">
                  Conclusao
                </FqText>
                <FqText as="p" className="text-sm font-semibold text-foreground">
                  {viewModel.weeklySummary.completionLabel}
                </FqText>
              </div>
              <div className="flex items-center justify-between gap-3">
                <FqText as="p" className="text-sm text-muted-foreground">
                  Treinos
                </FqText>
                <FqText as="p" className="text-sm font-semibold text-foreground">
                  {viewModel.weeklySummary.workoutLabel}
                </FqText>
              </div>
              <div className="flex items-center justify-between gap-3">
                <FqText as="p" className="text-sm text-muted-foreground">
                  Nutricao
                </FqText>
                <FqText as="p" className="text-sm font-semibold text-foreground">
                  {viewModel.weeklySummary.nutritionLabel}
                </FqText>
              </div>
              <div className="flex items-center justify-between gap-3">
                <FqText as="p" className="text-sm text-muted-foreground">
                  Ranking
                </FqText>
                <FqText as="p" className="text-sm font-semibold text-foreground">
                  {viewModel.weeklySummary.rankingLabel}
                </FqText>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FqCard>
  )
}
