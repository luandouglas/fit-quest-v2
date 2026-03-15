import { useHistory, useLocation } from 'react-router-dom'

import { FqButton, FqCard, FqQuickActions, FqTag, FqText, useToast } from '@/shared/ui'
import { studentService } from '@/shared/services'
import { canStudentStartWorkout, isStudentWorkoutExpired } from '@/shared/utils'

import { studentRoutes } from '../routes'
import { getStudentNavigationItem } from '../navigation'
import { useStudentHub } from '../hooks/useStudentHub'
import { StudentSectionRail } from './StudentSectionRail'

function toIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function StudentExperienceBanner() {
  const history = useHistory()
  const location = useLocation()
  const { toast } = useToast()
  const today = toIsoDate(new Date())
  const section = getStudentNavigationItem(location.pathname)
  const {
    dashboard,
    uiState,
    registerMeal,
    registerWater,
    isRegisterMealPending,
    isRegisterWaterPending,
  } = useStudentHub(today)
  const dataSource = studentService.getDataSource()
  const showDataSourceBadge = import.meta.env.DEV
  const canOpenWorkoutSession = canStudentStartWorkout(dashboard?.todayWorkout?.status)
  const workoutShortcutLabel =
    dashboard?.todayWorkout?.status === 'in_progress'
      ? 'Retomar treino'
      : canOpenWorkoutSession
        ? 'Iniciar treino'
        : isStudentWorkoutExpired(dashboard?.todayWorkout?.status)
          ? 'Treino expirado'
          : 'Ver treinos'

  function openWorkoutShortcut() {
    history.push(canOpenWorkoutSession ? studentRoutes.workoutSession : studentRoutes.workouts)
  }

  async function handleQuickMeal() {
    try {
      const response = await registerMeal()

      toast({
        title: response.mealId ? 'Refeição registrada' : 'Nenhuma refeição pendente',
        description: response.mealId
          ? 'Seu plano alimentar foi atualizado.'
          : 'Todas as refeições de hoje já foram registradas.',
        tone: response.mealId ? 'success' : 'warning',
      })
    } catch (error) {
      toast({
        title: 'Falha ao registrar refeição',
        description: error instanceof Error ? error.message : 'Tente novamente.',
        tone: 'danger',
      })
    }
  }

  async function handleQuickWater() {
    try {
      const response = await registerWater(300)

      toast({
        title: 'Água atualizada',
        description: `${response.totalWaterMl} ml acumulados hoje.`,
        tone: 'secondary',
      })
    } catch (error) {
      toast({
        title: 'Falha ao registrar água',
        description: error instanceof Error ? error.message : 'Tente novamente.',
        tone: 'danger',
      })
    }
  }

  const floatingActions =
    uiState === 'ready' && dashboard
      ? [
          {
            id: 'student-float-workout',
            label: workoutShortcutLabel,
            icon: 'play' as const,
            onClick: openWorkoutShortcut,
          },
          {
            id: 'student-float-meal',
            label: 'Refeição',
            icon: 'check' as const,
            onClick: () => {
              void handleQuickMeal()
            },
            disabled: isRegisterMealPending,
          },
          {
            id: 'student-float-water',
            label: 'Água',
            icon: 'plus' as const,
            onClick: () => {
              void handleQuickWater()
            },
            disabled: isRegisterWaterPending,
          },
        ]
      : []

  return (
    <>
      <div className="space-y-4">
        <FqCard className="fq-soft-reveal overflow-hidden border-border/80 bg-card/95">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <FqTag tone="primary">{section?.label ?? 'Jornada diária'}</FqTag>
                {showDataSourceBadge ? (
                  <FqTag tone="secondary">{dataSource === 'firebase' ? 'Firebase' : 'Mock'}</FqTag>
                ) : null}
                {uiState === 'ready' && dashboard ? (
                  <FqTag tone="success" leftIcon="flame">
                    {dashboard.dailyProgress.streakDays} dias de streak
                  </FqTag>
                ) : null}
              </div>

              <div className="space-y-2">
                <FqText as="p" className="fq-subtle-label">
                  Rotina guiada
                </FqText>
                <FqText as="h2" className="fq-display text-2xl leading-[1.05] text-foreground md:text-[2.35rem]">
                  {uiState === 'ready' && dashboard
                    ? dashboard.dailyProgress.focusLabel
                    : section?.description ?? 'Central do aluno'}
                </FqText>
                <FqText as="p" className="text-sm text-muted-foreground">
                  Uma visao leve da sua rotina, com navegacao simples e atalhos para manter constancia sem distracao.
                </FqText>
              </div>

              {uiState === 'ready' && dashboard ? (
                <div className="grid gap-2 sm:grid-cols-3">
                  <div className="fq-soft-block px-4 py-4">
                    <FqText as="p" className="fq-subtle-label">
                      Hoje
                    </FqText>
                    <FqText as="p" className="mt-2 text-base font-semibold text-foreground">
                      {dashboard.dailyProgress.completedBlocks}/{dashboard.dailyProgress.totalBlocks} blocos concluídos
                    </FqText>
                  </div>
                  <div className="fq-soft-block px-4 py-4">
                    <FqText as="p" className="fq-subtle-label">
                      Água
                    </FqText>
                    <FqText as="p" className="mt-2 text-base font-semibold text-foreground">
                      {dashboard.waterProgress.consumedMl}/{dashboard.waterProgress.targetMl} ml
                    </FqText>
                  </div>
                  <div className="fq-soft-block px-4 py-4">
                    <FqText as="p" className="fq-subtle-label">
                      XP do dia
                    </FqText>
                    <FqText as="p" className="mt-2 text-base font-semibold text-foreground">
                      {dashboard.dailyProgress.xpEarned} XP
                    </FqText>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="grid gap-3 self-start">
              <div className="fq-soft-block p-4">
                <FqText as="p" className="fq-subtle-label">
                  Atalhos essenciais
                </FqText>
                <FqText as="p" className="mt-2 text-sm text-muted-foreground">
                  Abra apenas o que precisa agora e volte para a jornada sem perder contexto.
                </FqText>
              </div>

              <FqButton leftIcon="play" onClick={openWorkoutShortcut} className="w-full justify-start">
                {workoutShortcutLabel}
              </FqButton>
              <FqButton
                variant="outline"
                tone="neutral"
                leftIcon="check"
                onClick={() => {
                  void handleQuickMeal()
                }}
                isLoading={isRegisterMealPending}
                className="w-full justify-start"
              >
                Registrar refeicao
              </FqButton>
              <FqButton
                variant="outline"
                tone="neutral"
                leftIcon="plus"
                onClick={() => {
                  void handleQuickWater()
                }}
                isLoading={isRegisterWaterPending}
                className="w-full justify-start"
              >
                Adicionar agua
              </FqButton>
            </div>
          </div>
        </FqCard>

        <StudentSectionRail activePath={location.pathname} />
      </div>

      <FqQuickActions actions={floatingActions} />
    </>
  )
}
