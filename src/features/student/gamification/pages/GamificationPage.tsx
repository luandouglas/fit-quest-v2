import { useHistory } from 'react-router-dom'

import { StudentModuleState, StudentPageHeader, StudentWaterQuickActionCard } from '@/features/student/components'
import { FqText, useToast } from '@/shared/ui'
import { studentRoutes } from '@/features/student/routes'

import {
  GamificationAchievementBoard,
  GamificationActivityCard,
  GamificationHeroCard,
  GamificationObjectivesCard,
  GamificationPageSkeleton,
  GamificationRankingSummaryCard,
  GamificationRewardsCard,
} from '../components'
import { useGamificationViewModel } from '../hooks/useGamificationViewModel'

export function GamificationPage() {
  const history = useHistory()
  const { toast } = useToast()
  const {
    data,
    dashboard,
    viewState,
    refresh,
    error,
    isDashboardReady,
    registerWater,
    isRegisterWaterPending,
  } = useGamificationViewModel()

  async function handleRegisterWater(amountMl: number) {
    if (!dashboard || !data) {
      return
    }

    try {
      const previous = dashboard.waterProgress
      const response = await registerWater(amountMl)
      const nextTotal = response.totalWaterMl
      const reachedGoal = nextTotal >= previous.targetMl

      toast({
        title: reachedGoal ? 'Estrelas e XP reforcados' : 'Agua registrada',
        description: reachedGoal
          ? `${nextTotal} ml acumulados. Meta batida, progresso diario reforcado e gamificacao atualizada.`
          : `${nextTotal} ml acumulados. Pequenas acoes mantem sua rota para estrelas, streak e nivel.`,
        tone: reachedGoal ? 'success' : 'secondary',
      })
    } catch (requestError) {
      toast({
        title: 'Falha ao registrar agua',
        description: requestError instanceof Error ? requestError.message : 'Tente novamente.',
        tone: 'danger',
      })
    }
  }

  if (viewState === 'loading') {
    return <GamificationPageSkeleton />
  }

  if (viewState === 'error') {
    return (
      <StudentModuleState
        state="error"
        tone="danger"
        title="Falha ao carregar gamificacao"
        description={error instanceof Error ? error.message : 'Nao foi possivel carregar seus dados gamificados agora.'}
        actionLabel="Tentar novamente"
        onAction={() => void refresh()}
        shellClassName="fq-page-shell"
      />
    )
  }

  if (viewState === 'empty' || !data) {
    return (
      <StudentModuleState
        state="empty"
        icon="gamepad"
        title="Gamificacao esperando sua primeira acao forte"
        description="Treino, cardio, agua e refeicoes concluidas vao liberar estrelas, streak e conquistas daqui em diante."
        actionLabel="Voltar para Home"
        onAction={() => history.push(studentRoutes.hub)}
        shellClassName="fq-page-shell"
      />
    )
  }

  return (
    <section className="fq-page-shell">
      <StudentPageHeader
        eyebrow="Retorno diário"
        title="Gamificação"
        description="Estrelas, nível, streak, conquistas e ranking trabalhando como um sistema de retorno diário, não como decoração."
        tags={[
          {
            id: 'stars-total',
            label: `${data.stars} estrelas`,
            tone: 'warning',
            icon: 'star',
          },
          {
            id: 'next-level',
            label: `${data.nextLevelRemaining} XP para o próximo nível`,
            tone: data.nextLevelRemaining > 0 ? 'secondary' : 'success',
            icon: 'target',
          },
        ]}
      />

      <GamificationHeroCard
        stars={data.stars}
        level={data.overview.level}
        streakDays={data.streakDays}
        weeklyStreak={data.overview.weeklyStreak}
        currentLevelXp={data.overview.currentLevelXp}
        nextLevelXp={data.overview.nextLevelXp}
        nextLevelRemaining={data.nextLevelRemaining}
        todayXp={data.overview.todayXp}
        weeklyXp={data.overview.weeklyXp}
        weeklyXpTarget={data.overview.weeklyXpTarget}
        trendLabel={data.trendLabel}
        feedback={data.feedback}
      />

      {isDashboardReady && dashboard ? (
        <StudentWaterQuickActionCard
          waterProgress={dashboard.waterProgress}
          onAddWater={handleRegisterWater}
          isPending={isRegisterWaterPending}
          title="Microacao que vale progresso"
          description="Hidratacao bem registrada ajuda a fechar o dia, protege o streak e ainda rende estrelas dentro da rotina do aluno."
          footer={
            <div className="rounded-xl border border-border/70 bg-background/70 p-4">
              <FqText as="p" className="text-sm font-semibold text-foreground">
                Agua dentro da gamificacao
              </FqText>
              <FqText as="p" className="mt-2 text-xs text-muted-foreground">
                Hoje a hidratacao ja soma {data.overview.xpBreakdown.hydration} XP no ledger e acelera o fechamento do progresso diario.
              </FqText>
            </div>
          }
        />
      ) : null}

      <div className="grid gap-4 xl:fq-grid-balanced-wider">
        <GamificationObjectivesCard
          items={data.pendingObjectives}
          completedDailyMissions={data.completedDailyMissions}
          totalDailyMissions={data.overview.dailyMissions.length}
          completedWeeklyMissions={data.completedWeeklyMissions}
          totalWeeklyMissions={data.overview.weeklyMissions.length}
        />
        <GamificationRankingSummaryCard ranking={data.ranking} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <GamificationAchievementBoard
          unlocked={data.achievements.unlocked}
          upcoming={data.achievements.upcoming}
        />
        <GamificationRewardsCard earned={data.rewards.earned} next={data.rewards.next} />
      </div>

      <GamificationActivityCard heatmap={data.overview.activityHeatmap} timeline={data.ledgerTimeline} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-border/80 bg-card/90 p-5 shadow-overlay">
          <FqText as="p" className="text-xs text-muted-foreground">
            XP treino
          </FqText>
          <FqText as="p" className="mt-2 text-card-title font-semibold text-foreground">
            {data.overview.xpBreakdown.workout}
          </FqText>
        </div>
        <div className="rounded-2xl border border-border/80 bg-card/90 p-5 shadow-overlay">
          <FqText as="p" className="text-xs text-muted-foreground">
            XP cardio
          </FqText>
          <FqText as="p" className="mt-2 text-card-title font-semibold text-foreground">
            {data.overview.xpBreakdown.run}
          </FqText>
        </div>
        <div className="rounded-2xl border border-border/80 bg-card/90 p-5 shadow-overlay">
          <FqText as="p" className="text-xs text-muted-foreground">
            XP nutricao
          </FqText>
          <FqText as="p" className="mt-2 text-card-title font-semibold text-foreground">
            {data.overview.xpBreakdown.nutrition}
          </FqText>
        </div>
        <div className="rounded-2xl border border-border/80 bg-card/90 p-5 shadow-overlay">
          <FqText as="p" className="text-xs text-muted-foreground">
            XP hidratacao
          </FqText>
          <FqText as="p" className="mt-2 text-card-title font-semibold text-foreground">
            {data.overview.xpBreakdown.hydration}
          </FqText>
        </div>
      </div>
    </section>
  )
}
