import { FqButton, FqCard, FqProgressBar, FqTag, FqText } from '@/shared/ui'
import type { StudentDashboard } from '@/shared/services/contracts/student'

import { studentRoutes } from '../routes'

type StudentDailyFocusCardProps = {
  dashboard: StudentDashboard
  onNavigate: (path: string) => void
}

function getPrimaryAction(dashboard: StudentDashboard) {
  if (dashboard.todayWorkout?.status === 'scheduled') {
    return {
      label: 'Iniciar treino do dia',
      route: studentRoutes.workoutSession,
      helper: 'Seu maior impacto em progresso e estrelas costuma começar pelo treino.',
    }
  }

  if (dashboard.todayWorkout?.status === 'in_progress') {
    return {
      label: 'Retomar treino',
      route: studentRoutes.workoutSession,
      helper: 'Seu treino ja esta aberto. Retome antes de acumular pendencias.',
    }
  }

  const nextMeal = dashboard.nutritionPlan.meals.find((meal) => meal.status === 'pending')
  if (nextMeal) {
    return {
      label: `Registrar ${nextMeal.name.toLowerCase()}`,
      route: studentRoutes.nutrition,
      helper: 'Fechar refeicoes no horario certo melhora aderencia e reduz esquecimento.',
    }
  }

  if (dashboard.waterProgress.remainingMl > 0) {
    return {
      label: 'Adicionar agua agora',
      route: studentRoutes.nutrition,
      helper: 'Pequenas doses ao longo do dia batem a meta com menos atrito.',
    }
  }

  if (dashboard.cardioSession?.status !== 'completed') {
    return {
      label: 'Registrar cardio',
      route: studentRoutes.cardio,
      helper: 'Mais alguns minutos de cardio ajudam a empurrar consistencia e gasto semanal.',
    }
  }

  return {
    label: 'Ver recompensas do dia',
    route: studentRoutes.rewards,
    helper: 'Seu dia esta bem encaminhado. Agora vale colher as recompensas e mirar o proximo nivel.',
  }
}

export function StudentDailyFocusCard({ dashboard, onNavigate }: StudentDailyFocusCardProps) {
  const completedMeals = dashboard.nutritionPlan.meals.filter((meal) => meal.status === 'completed').length
  const primaryAction = getPrimaryAction(dashboard)

  return (
    <FqCard className="border-border/80 bg-card/95">
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <FqText as="p" className="fq-subtle-label">
              Foco diário
            </FqText>
            <FqText as="h2" className="mt-2 text-base font-semibold text-foreground">
              Ritmo, clareza e próximo passo
            </FqText>
            <FqText as="p" className="text-sm text-muted-foreground">
              Seu panorama do dia em um único bloco, com progresso e pendências reais.
            </FqText>
          </div>
          <FqTag tone={dashboard.dailyProgress.status === 'completed' ? 'success' : 'warning'}>
            {dashboard.dailyProgress.status === 'completed' ? 'Dia fechado' : 'Em andamento'}
          </FqTag>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_0.85fr]">
          <div className="space-y-4 rounded-[calc(var(--radius)+6px)] border border-border/75 bg-background/72 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
            <FqText as="p" className="text-sm font-semibold text-foreground">
              Progresso diário
            </FqText>
            <div className="mt-3">
              <FqProgressBar value={dashboard.dailyProgress.completionPct} tone={dashboard.dailyProgress.status === 'completed' ? 'success' : 'primary'} />
            </div>
            <FqText as="p" className="mt-2 text-xs text-muted-foreground">
              {dashboard.dailyProgress.completedBlocks}/{dashboard.dailyProgress.totalBlocks} blocos concluídos
            </FqText>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="fq-soft-block px-3 py-3 shadow-[0_8px_20px_rgba(36,49,44,0.04)]">
                <FqText as="p" className="fq-subtle-label">
                  Treino
                </FqText>
                <FqText as="p" className="mt-2 text-sm font-semibold text-foreground">
                  {dashboard.todayWorkout?.status === 'completed'
                    ? 'Concluido'
                    : dashboard.todayWorkout?.status === 'in_progress'
                      ? 'Em andamento'
                      : dashboard.todayWorkout
                        ? 'Pendente'
                        : 'Livre'}
                </FqText>
              </div>
              <div className="fq-soft-block px-3 py-3 shadow-[0_8px_20px_rgba(36,49,44,0.04)]">
                <FqText as="p" className="fq-subtle-label">
                  Nutrição
                </FqText>
                <FqText as="p" className="mt-2 text-sm font-semibold text-foreground">
                  {completedMeals}/{dashboard.nutritionPlan.meals.length} refeições
                </FqText>
              </div>
              <div className="fq-soft-block px-3 py-3 shadow-[0_8px_20px_rgba(36,49,44,0.04)]">
                <FqText as="p" className="fq-subtle-label">
                  Água
                </FqText>
                <FqText as="p" className="mt-2 text-sm font-semibold text-foreground">
                  {dashboard.waterProgress.remainingMl > 0
                    ? `Faltam ${dashboard.waterProgress.remainingMl} ml`
                    : 'Meta concluida'}
                </FqText>
              </div>
            </div>
          </div>

          <div className="rounded-[calc(var(--radius)+6px)] border border-primary/14 bg-[linear-gradient(180deg,rgba(95,141,118,0.09)_0%,rgba(95,141,118,0.04)_100%)] p-4 shadow-[0_14px_30px_rgba(95,141,118,0.08)]">
            <FqText as="p" className="fq-subtle-label">
              Missão de hoje
            </FqText>
            <FqText as="p" className="mt-2 text-sm font-semibold text-foreground">
              Fechar treino, hidratação e plano alimentar para manter streak e ganhar estrelas extras.
            </FqText>
            <FqText as="p" className="mt-2 text-sm text-muted-foreground">
              Pequenas confirmações ao longo do dia deixam a rotina mais simples e evitam acúmulo no fim da noite.
            </FqText>
            <div className="mt-3 flex flex-wrap gap-2">
              <FqTag tone="secondary">{dashboard.dailyProgress.xpEarned} XP</FqTag>
              <FqTag tone="warning">{dashboard.dailyProgress.starsEarned} estrelas</FqTag>
            </div>
            <div className="mt-4 rounded-[calc(var(--radius)+6px)] border border-white/45 bg-card/94 p-4 shadow-[0_12px_24px_rgba(36,49,44,0.05)]">
              <FqText as="p" className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Próximo passo recomendado
              </FqText>
              <FqText as="p" className="mt-2 text-sm font-semibold text-foreground">
                {primaryAction.label}
              </FqText>
              <FqText as="p" className="mt-1 text-xs text-muted-foreground">
                {primaryAction.helper}
              </FqText>
              <FqButton className="mt-3 w-full sm:w-auto" onClick={() => onNavigate(primaryAction.route)}>
                {primaryAction.label}
              </FqButton>
            </div>
          </div>
        </div>
      </div>
    </FqCard>
  )
}
