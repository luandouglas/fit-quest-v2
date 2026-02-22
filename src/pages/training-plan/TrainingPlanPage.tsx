import { useEffect, useMemo, useState } from 'react'
import { useHistory } from 'react-router-dom'

import { FqAlert, FqButton, FqEmptyState, FqIcon, FqSkeleton, FqText } from '@/shared/ui'
import { WeeklyCalendarCard } from './components/WeeklyCalendarCard'
import { TodayWorkoutHero } from './components/TodayWorkoutHero'
import { ExerciseList } from './components/ExerciseList'
import { DesktopSummaryPanel } from './components/DesktopSummaryPanel'

export type TrainingPlanDay = {
  date: string
  weekday: string
  isToday: boolean
  isCompleted: boolean
  hasWorkout: boolean
}

export type TodayWorkout = {
  title: string
  durationMin: number
  calories: number
  stars: number
  progressPct: number
  completedCount: number
  totalCount: number
}

export type ExerciseItem = {
  id: string
  name: string
  sets: number
  reps: number
  durationMin: number
  status: 'done' | 'current' | 'upcoming'
  order: number
  iconName?: 'dumbbell' | 'flame' | 'target'
}

type UiState = 'loading' | 'ready' | 'empty' | 'error'

const mockWeek: TrainingPlanDay[] = [
  { date: '2026-02-16', weekday: 'Seg', isToday: false, isCompleted: true, hasWorkout: true },
  { date: '2026-02-17', weekday: 'Ter', isToday: false, isCompleted: true, hasWorkout: true },
  { date: '2026-02-18', weekday: 'Qua', isToday: false, isCompleted: true, hasWorkout: true },
  { date: '2026-02-19', weekday: 'Qui', isToday: true, isCompleted: false, hasWorkout: true },
  { date: '2026-02-20', weekday: 'Sex', isToday: false, isCompleted: false, hasWorkout: true },
  { date: '2026-02-21', weekday: 'Sab', isToday: false, isCompleted: false, hasWorkout: false },
  { date: '2026-02-22', weekday: 'Dom', isToday: false, isCompleted: false, hasWorkout: false },
]

const mockExercises: ExerciseItem[] = [
  { id: 'bench-press', name: 'Bench Press', sets: 4, reps: 12, durationMin: 12, status: 'done', order: 1, iconName: 'target' },
  { id: 'shoulder-press', name: 'Shoulder Press', sets: 3, reps: 10, durationMin: 10, status: 'done', order: 2, iconName: 'dumbbell' },
  { id: 'tricep-dips', name: 'Tricep Dips', sets: 3, reps: 15, durationMin: 8, status: 'current', order: 3, iconName: 'flame' },
  { id: 'lateral-raises', name: 'Lateral Raises', sets: 3, reps: 12, durationMin: 8, status: 'upcoming', order: 4, iconName: 'dumbbell' },
  { id: 'push-ups', name: 'Push-ups', sets: 3, reps: 20, durationMin: 6, status: 'upcoming', order: 5, iconName: 'target' },
]

const LOADING_DELAY_MS = 450

export function TrainingPlanPage() {
  const history = useHistory()
  const [uiState, setUiState] = useState<UiState>('loading')
  const [hasWorkoutToday, setHasWorkoutToday] = useState(true)
  const [exercises, setExercises] = useState<ExerciseItem[]>(mockExercises)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setUiState('ready')
    }, LOADING_DELAY_MS)

    return () => window.clearTimeout(timeout)
  }, [])

  const doneCount = useMemo(() => exercises.filter((exercise) => exercise.status === 'done').length, [exercises])
  const totalCount = exercises.length
  const progressPct = Math.round((doneCount / Math.max(totalCount, 1)) * 100)

  const todayWorkout: TodayWorkout = useMemo(
    () => ({
      title: 'Upper Body Day',
      durationMin: 44,
      calories: 285,
      stars: 25,
      progressPct,
      completedCount: doneCount,
      totalCount,
    }),
    [doneCount, totalCount, progressPct],
  )

  const totalDurationMin = useMemo(
    () => exercises.reduce((totalValue, exercise) => totalValue + exercise.durationMin, 0),
    [exercises],
  )

  const isStarted = useMemo(() => exercises.some((exercise) => exercise.status === 'current' || exercise.status === 'done'), [exercises])

  function handleStartWorkout() {
    history.push('/treinos/sessao')
  }

  function handleSetCurrent(id: string) {
    setExercises((currentExercises) => {
      const hasTarget = currentExercises.some((exercise) => exercise.id === id)

      if (!hasTarget) {
        return currentExercises
      }

      return currentExercises.map((exercise) => {
        if (exercise.id === id && exercise.status !== 'done') {
          return { ...exercise, status: 'current' }
        }

        if (exercise.status === 'current' && exercise.id !== id) {
          return { ...exercise, status: 'upcoming' }
        }

        return exercise
      })
    })
  }

  function handleToggleDone(id: string) {
    setExercises((currentExercises) => {
      const nextExercises = currentExercises.map((exercise) => {
        if (exercise.id !== id) {
          return exercise
        }

        const nextStatus: ExerciseItem['status'] = exercise.status === 'done' ? 'upcoming' : 'done'

        return {
          ...exercise,
          status: nextStatus,
        }
      })

      const hasCurrent = nextExercises.some((exercise) => exercise.status === 'current')

      if (!hasCurrent) {
        const firstUpcomingIndex = nextExercises.findIndex((exercise) => exercise.status === 'upcoming')

        if (firstUpcomingIndex >= 0) {
          nextExercises[firstUpcomingIndex] = {
            ...nextExercises[firstUpcomingIndex],
            status: 'current',
          }
        }
      }

      return nextExercises
    })
  }

  function handleRetry() {
    setUiState('loading')
    window.setTimeout(() => setUiState('ready'), LOADING_DELAY_MS)
  }

  function handleBack() {
    history.goBack()
  }

  if (uiState === 'loading') {
    return (
      <section className="mx-auto w-full max-w-[1280px] space-y-5">
        <FqSkeleton className="h-10 w-52" rounded="lg" />
        <div className="grid gap-5 lg:grid-cols-12">
          <FqSkeleton className="h-56 w-full lg:col-span-3" rounded="lg" />
          <div className="space-y-4 lg:col-span-6">
            <FqSkeleton className="h-44 w-full" rounded="lg" />
            <FqSkeleton className="h-24 w-full" rounded="lg" />
            <FqSkeleton className="h-24 w-full" rounded="lg" />
          </div>
          <FqSkeleton className="h-52 w-full lg:col-span-3" rounded="lg" />
        </div>
      </section>
    )
  }

  if (uiState === 'error') {
    return (
      <section className="mx-auto w-full max-w-[1280px] space-y-4">
        <FqAlert tone="danger" title="Não foi possível carregar seus treinos">
          Verifique sua conexão e tente novamente.
        </FqAlert>
        <FqButton onClick={handleRetry} leftIcon="arrowRight">
          Tentar novamente
        </FqButton>
      </section>
    )
  }

  if (uiState === 'empty' || !hasWorkoutToday) {
    return (
      <section className="mx-auto w-full max-w-[1280px] space-y-4">
        <header className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Voltar"
            onClick={handleBack}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-accent text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <FqIcon name="arrowLeft" size={16} />
          </button>
          <FqText as="h1" variant="title" className="text-lg">
            Treinos
          </FqText>
        </header>

        <FqEmptyState
          icon="dumbbell"
          title="Sem treino atribuído para hoje"
          description="Você pode explorar os planos disponíveis e escolher um treino para continuar evoluindo."
          actionLabel="Ver planos"
          onAction={() => setHasWorkoutToday(true)}
        />
      </section>
    )
  }

  return (
    <section className="mx-auto w-full max-w-[1280px] space-y-5">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Voltar"
            onClick={handleBack}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-accent text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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

        <div className="hidden gap-2 md:flex">
          <FqButton variant="outline" tone="secondary" leftIcon="calendar" onClick={() => setUiState('error')}>
            Simular erro
          </FqButton>
          <FqButton variant="outline" tone="neutral" leftIcon="moon" onClick={() => setHasWorkoutToday(false)}>
            Simular vazio
          </FqButton>
        </div>
      </header>

      <div className="grid items-start gap-5 lg:grid-cols-12 xl:gap-6">
        <div className="space-y-4 lg:col-span-3 lg:sticky lg:top-5 lg:h-fit">
          <WeeklyCalendarCard days={mockWeek} />

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

        <div className="space-y-4 lg:col-span-6">
          <TodayWorkoutHero workout={todayWorkout} onStart={handleStartWorkout} />
          <ExerciseList exercises={exercises} onSetCurrent={handleSetCurrent} onToggleDone={handleToggleDone} />
        </div>

        <div className="lg:col-span-3">
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
