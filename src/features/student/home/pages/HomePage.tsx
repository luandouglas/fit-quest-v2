import { useMemo } from 'react'
import { useHistory } from 'react-router-dom'

import { studentRoutes } from '@/features/student/routes'
import { FqAlert, FqButton, FqCard, FqEmptyState, FqProgressBar, FqTag, FqText, FqStatCard, useToast } from '@/shared/ui'

import { useHomeDashboard } from '../hooks/useHomeDashboard'

function formatDateTime(isoDate: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoDate))
}

export function HomePage() {
  const history = useHistory()
  const { toast } = useToast()
  const {
    overview,
    uiState,
    error,
    refresh,
    registerMeal,
    registerWater,
    isRegisterMealPending,
    isRegisterWaterPending,
  } = useHomeDashboard()

  const waterPct = useMemo(() => {
    if (!overview) {
      return 0
    }

    return Math.round((overview.summary.waterConsumedMl / Math.max(overview.summary.waterGoalMl, 1)) * 100)
  }, [overview])

  const mealPct = useMemo(() => {
    if (!overview) {
      return 0
    }

    return Math.round((overview.summary.mealsLogged / Math.max(overview.summary.mealsTotal, 1)) * 100)
  }, [overview])

  async function handleRegisterMeal() {
    try {
      const response = await registerMeal()

      if (!response.mealId) {
        toast({
          title: 'Sem refeicao pendente',
          description: 'Todas as refeicoes de hoje ja foram registradas.',
          tone: 'warning',
        })
        return
      }

      toast({
        title: 'Refeicao registrada',
        description: 'Check-in rapido realizado com sucesso.',
        tone: 'success',
      })
    } catch (requestError) {
      toast({
        title: 'Falha ao registrar refeicao',
        description: requestError instanceof Error ? requestError.message : 'Tente novamente.',
        tone: 'danger',
      })
    }
  }

  async function handleRegisterWater() {
    try {
      const response = await registerWater(250)
      toast({
        title: 'Hidratacao atualizada',
        description: `Total de agua hoje: ${response.totalWaterMl} ml.`,
        tone: 'secondary',
      })
    } catch (requestError) {
      toast({
        title: 'Falha ao registrar agua',
        description: requestError instanceof Error ? requestError.message : 'Tente novamente.',
        tone: 'danger',
      })
    }
  }

  if (uiState === 'loading') {
    return (
      <section className="fq-page-shell">
        <FqCard className="border-border bg-card">
          <FqText as="h1" variant="title">
            Carregando dashboard...
          </FqText>
        </FqCard>
      </section>
    )
  }

  if (uiState === 'error') {
    return (
      <section className="fq-page-shell">
        <FqAlert tone="danger" title="Falha ao carregar seu inicio">
          {error instanceof Error ? error.message : 'Nao foi possivel carregar o dashboard.'}
        </FqAlert>
        <FqButton variant="outline" tone="neutral" onClick={() => void refresh()}>
          Tentar novamente
        </FqButton>
      </section>
    )
  }

  if (uiState === 'empty' || !overview) {
    return (
      <section className="fq-page-shell">
        <FqEmptyState
          icon="home"
          title="Sem dados para seu dashboard"
          description="Complete sua primeira acao de treino ou nutricao para montar o painel inteligente."
        />
      </section>
    )
  }

  return (
    <section className="fq-page-shell">
      <header className="fq-page-header">
        <FqText as="h1" variant="title">
          Inicio
        </FqText>
        <FqText as="p" className="text-sm text-muted-foreground">
          Dashboard do dia com treino, nutricao e progresso em tempo real.
        </FqText>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <FqStatCard
          label="Treino de hoje"
          value={overview.summary.todayWorkout.hasWorkout ? overview.summary.todayWorkout.title : 'Sem treino'}
          icon="dumbbell"
        />
        <FqStatCard
          label="Agua"
          value={`${overview.summary.waterConsumedMl}/${overview.summary.waterGoalMl} ml`}
          delta={`${waterPct}% da meta`}
          icon="flask"
        />
        <FqStatCard
          label="Refeicoes"
          value={`${overview.summary.mealsLogged}/${overview.summary.mealsTotal}`}
          delta={`${mealPct}% registradas`}
          icon="utensils"
        />
        <FqStatCard label="XP hoje" value={overview.summary.xpToday} icon="star" />
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <FqCard className="border-border bg-card lg:col-span-7">
          <div className="space-y-3">
            <FqText as="h2" className="text-sm font-semibold text-foreground">
              Acoes rapidas
            </FqText>

            <div className="grid gap-2 sm:grid-cols-3">
              <FqButton
                leftIcon="play"
                onClick={() => {
                  history.push(studentRoutes.workouts)
                }}
                isDisabled={!overview.quickActions.canStartWorkout}
              >
                Iniciar treino
              </FqButton>
              <FqButton
                leftIcon="check"
                tone="primary"
                onClick={() => void handleRegisterMeal()}
                isLoading={isRegisterMealPending}
                isDisabled={!overview.quickActions.canRegisterMeal}
              >
                Registrar refeicao
              </FqButton>
              <FqButton
                leftIcon="plus"
                tone="primary"
                variant="outline"
                onClick={() => void handleRegisterWater()}
                isLoading={isRegisterWaterPending}
                isDisabled={!overview.quickActions.canRegisterWater}
              >
                Registrar agua
              </FqButton>
            </div>

            <div className="space-y-2 rounded-xl border border-border bg-muted/20 p-3">
              <div className="flex items-center justify-between gap-2">
                <FqText as="p" className="text-sm font-semibold text-foreground">
                  Missao diaria ativa
                </FqText>
                <FqTag tone={overview.mission.status === 'completed' ? 'success' : 'warning'}>
                  {overview.mission.status === 'completed' ? 'Concluida' : 'Ativa'}
                </FqTag>
              </div>
              <FqText as="p" className="text-sm text-muted-foreground">
                {overview.mission.title}
              </FqText>
              <FqProgressBar
                value={Math.round((overview.mission.current / Math.max(overview.mission.target, 1)) * 100)}
                tone={overview.mission.status === 'completed' ? 'success' : 'primary'}
              />
              <FqText as="p" className="text-xs text-muted-foreground">
                {overview.mission.current}/{overview.mission.target}
              </FqText>
            </div>
          </div>
        </FqCard>

        <aside className="space-y-4 lg:col-span-5">
          <FqCard className="border-border bg-card">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <FqText as="h2" className="text-sm font-semibold text-foreground">
                  Streak atual
                </FqText>
                <FqTag tone={overview.streak.days > 0 ? 'success' : 'neutral'} leftIcon="flame">
                  {overview.streak.label}
                </FqTag>
              </div>
              <FqText as="p" className="text-sm text-muted-foreground">
                Considera dias consecutivos com treino concluido ou meta de agua batida.
              </FqText>
            </div>
          </FqCard>

          <FqCard className="border-border bg-card">
            <div className="space-y-2">
              <FqText as="h2" className="text-sm font-semibold text-foreground">
                Ultima notificacao relevante
              </FqText>

              {overview.latestNotification ? (
                <>
                  <FqTag tone="secondary">{overview.latestNotification.title}</FqTag>
                  <FqText as="p" className="text-sm text-muted-foreground">
                    {overview.latestNotification.description}
                  </FqText>
                  <FqText as="p" className="text-xs text-muted-foreground">
                    {formatDateTime(overview.latestNotification.at)}
                  </FqText>
                </>
              ) : (
                <FqText as="p" className="text-sm text-muted-foreground">
                  Nenhuma atualizacao relevante hoje.
                </FqText>
              )}
            </div>
          </FqCard>
        </aside>
      </div>
    </section>
  )
}
