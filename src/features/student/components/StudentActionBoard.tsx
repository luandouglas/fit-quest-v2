import { FqButton, FqCard, FqProgressBar, FqTag, FqText } from '@/shared/ui'
import {
  studentQuickActionKeys,
  studentQuickActionStatuses,
  type CardioSession,
  type StudentQuickAction,
  type WorkoutDay,
} from '@/shared/services/contracts/student'
import { isStudentWorkoutExpired } from '@/shared/utils'

type StudentActionBoardProps = {
  quickActions: StudentQuickAction[]
  todayWorkout: WorkoutDay | null
  cardioSession: CardioSession | null
  onNavigate: (path: string) => void
  onRegisterMeal: () => Promise<void>
  onRegisterWater: () => Promise<void>
  isRegisterMealPending: boolean
  isRegisterWaterPending: boolean
}

function getWorkoutStatusLabel(todayWorkout: WorkoutDay | null) {
  if (!todayWorkout) {
    return 'Sem treino prescrito'
  }

  if (todayWorkout.status === 'completed') {
    return 'Treino concluído'
  }

  if (todayWorkout.status === 'in_progress') {
    return 'Sessão em andamento'
  }

  if (todayWorkout.status === 'rest_day') {
    return 'Dia de recuperação'
  }

  if (todayWorkout.status === 'skipped') {
    return 'Janela encerrada'
  }

  return 'Pronto para execução'
}

export function StudentActionBoard({
  quickActions,
  todayWorkout,
  cardioSession,
  onNavigate,
  onRegisterMeal,
  onRegisterWater,
  isRegisterMealPending,
  isRegisterWaterPending,
}: StudentActionBoardProps) {
  return (
    <FqCard className="border-border bg-card">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <FqText as="h2" className="text-base font-semibold text-foreground">
              Centro de execução do dia
            </FqText>
            <FqText as="p" className="text-sm text-muted-foreground">
              As ações rápidas ficam no centro da rotina diária do aluno.
            </FqText>
          </div>

          <div className="flex flex-wrap gap-2">
            <FqTag
              tone={todayWorkout?.status === 'completed' ? 'success' : isStudentWorkoutExpired(todayWorkout?.status) ? 'warning' : 'warning'}
              leftIcon="dumbbell"
            >
              {getWorkoutStatusLabel(todayWorkout)}
            </FqTag>
            {cardioSession ? (
              <FqTag tone={cardioSession.status === 'completed' ? 'success' : 'secondary'} leftIcon="mapPin">
                {cardioSession.title}
              </FqTag>
            ) : null}
          </div>
        </div>

        {todayWorkout ? (
          <div className="rounded-2xl border border-border bg-muted/10 p-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <FqText as="p" className="text-sm font-semibold text-foreground">
                  {todayWorkout.title}
                </FqText>
                <FqText as="p" className="text-sm text-muted-foreground">
                  {todayWorkout.focus} • {todayWorkout.estimatedDurationMin} min • {todayWorkout.rewardStars} estrelas
                </FqText>
              </div>
              <FqTag tone="neutral">{todayWorkout.exercises.length} exercícios</FqTag>
            </div>
            <div className="mt-3">
              <FqProgressBar value={todayWorkout.completionPct} tone={todayWorkout.status === 'completed' ? 'success' : 'primary'} />
            </div>
          </div>
        ) : null}

        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-5">
          {quickActions.map((action) => {
            const isDisabled = action.status === studentQuickActionStatuses.locked
            const isCompleted = action.status === studentQuickActionStatuses.completed
            const isMealAction = action.key === studentQuickActionKeys.logMeal
            const isWaterAction = action.key === studentQuickActionKeys.logWater

            return (
              <FqButton
                key={action.id}
                variant={isCompleted ? 'outline' : 'solid'}
                tone={isCompleted ? 'success' : 'primary'}
                className="min-h-20 flex-col items-start justify-between text-left"
                leftIcon={action.icon}
                isDisabled={isDisabled}
                isLoading={(isMealAction && isRegisterMealPending) || (isWaterAction && isRegisterWaterPending)}
                onClick={() => {
                  if (isMealAction) {
                    void onRegisterMeal()
                    return
                  }

                  if (isWaterAction) {
                    void onRegisterWater()
                    return
                  }

                  onNavigate(action.targetRoute)
                }}
              >
                <span className="block">{action.label}</span>
                <span className="block text-xs font-normal opacity-80">{action.description}</span>
              </FqButton>
            )
          })}
        </div>
      </div>
    </FqCard>
  )
}
