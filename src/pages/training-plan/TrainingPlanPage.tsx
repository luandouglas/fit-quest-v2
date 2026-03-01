import { useHistory } from 'react-router-dom'

import { workoutService } from '@/shared/services'
import { FqButton, FqIcon, FqText } from '@/shared/ui'
import {
  DesktopSummaryPanel,
  ExerciseList,
  TodayWorkoutHero,
  WeeklyCalendarCard,
} from './components'
import {
  TrainingPlanEmptyState,
  TrainingPlanErrorState,
  TrainingPlanLoadingState,
} from './components/TrainingPlanFeedbackStates'
import { useTrainingPlanState } from './hooks/useTrainingPlanState'

export function TrainingPlanPage() {
  const history = useHistory()
  const week = workoutService.getWeekSnapshot()
  const {
    uiState,
    hasWorkoutToday,
    exercises,
    progressPct,
    todayWorkout,
    totalDurationMin,
    isStarted,
    setUiState,
    setHasWorkoutToday,
    setCurrentExercise,
    toggleExerciseDone,
    retryLoad,
  } = useTrainingPlanState()

  function handleStartWorkout() {
    history.push('/treinos/sessao')
  }

  function handleBack() {
    history.goBack()
  }

  if (uiState === 'loading') {
    return <TrainingPlanLoadingState />
  }

  if (uiState === 'error') {
    return <TrainingPlanErrorState onRetry={retryLoad} />
  }

  if (uiState === 'empty' || !hasWorkoutToday) {
    return (
      <TrainingPlanEmptyState
        onBack={handleBack}
        onShowPlans={() => setHasWorkoutToday(true)}
      />
    )
  }

  return (
    <section className="space-y-6 lg:space-y-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <button
            type="button"
            aria-label="Voltar"
            onClick={handleBack}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-accent text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
          >
            <FqIcon name="arrowLeft" size={16} />
          </button>

          <div>
            <FqText as="h1" variant="title" className="text-lg text-foreground">
              Treinos
            </FqText>
            <FqText as="p" className="text-sm text-muted-foreground">
              Seu plano de treino semanal
            </FqText>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 sm:justify-end">
          <FqButton
            variant="outline"
            tone="secondary"
            leftIcon="calendar"
            onClick={() => setUiState('error')}
            size="sm"
          >
            Simular erro
          </FqButton>
          <FqButton
            variant="outline"
            tone="neutral"
            leftIcon="moon"
            onClick={() => setHasWorkoutToday(false)}
            size="sm"
          >
            Simular vazio
          </FqButton>
        </div>
      </header>

      <div className="grid items-start gap-5 lg:grid-cols-12 xl:gap-6">
        <div className="order-3 space-y-4 lg:order-1 lg:col-span-3 lg:sticky lg:top-5 lg:h-fit">
          <WeeklyCalendarCard days={week} />

          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Atalhos</p>
            <div className="mt-3 space-y-2">
              <FqButton className="w-full" variant="outline" tone="neutral" leftIcon="list">
                Ver histórico
              </FqButton>
              <FqButton className="w-full" variant="outline" tone="secondary" leftIcon="target">
                Metas da semana
              </FqButton>
            </div>
          </div>
        </div>

        <div className="order-1 space-y-4 lg:order-2 lg:col-span-6">
          <TodayWorkoutHero workout={todayWorkout} onStart={handleStartWorkout} />
          <ExerciseList
            exercises={exercises}
            onSetCurrent={setCurrentExercise}
            onToggleDone={toggleExerciseDone}
          />
        </div>

        <div className="order-2 lg:order-3 lg:col-span-3">
          <DesktopSummaryPanel
            progressPct={progressPct}
            stars={todayWorkout.stars}
            totalDurationMin={totalDurationMin}
            isStarted={isStarted}
            onStart={handleStartWorkout}
          />
        </div>
      </div>
    </section>
  )
}
