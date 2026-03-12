import { useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Dumbbell,
  Flame,
  PlayCircle,
  Sparkles,
  Target,
  Trophy,
} from 'lucide-react'

import { studentRoutes } from '@/features/student/routes'
import { workoutService } from '@/shared/services'
import { FqAlert, FqButton } from '@/shared/ui'
import { cx } from '@/shared/utils'

import { ExerciseInsightModal } from './components/ExerciseInsightModal'

type WorkoutDetailRouteParams = {
  workoutId: string
}

function formatDate(date: string, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    ...options,
  }).format(new Date(`${date}T12:00:00`))
}

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

function formatDuration(totalSec: number) {
  return `${Math.max(Math.round(totalSec / 60), 1)} min`
}

function formatLoad(load?: number) {
  return typeof load === 'number' ? `${load} kg` : 'Carga livre'
}

function getAdherenceLabel(adherencePct: number) {
  if (adherencePct >= 90) {
    return 'Aderencia alta'
  }

  if (adherencePct >= 60) {
    return 'Boa consistencia'
  }

  return 'Espaco para ganhar ritmo'
}

function getStatusClasses(status: 'completed' | 'pending' | 'late') {
  if (status === 'completed') {
    return 'bg-primary text-primary-foreground shadow-[0_12px_24px_rgba(95,141,118,0.18)]'
  }

  if (status === 'late') {
    return 'bg-destructive/12 text-destructive'
  }

  return 'bg-secondary/14 text-secondary'
}

function getExerciseStatusClasses(status: 'done' | 'current' | 'upcoming') {
  if (status === 'done') {
    return 'border-primary/18 bg-primary/8'
  }

  if (status === 'current') {
    return 'border-secondary/22 bg-secondary/8'
  }

  return 'border-border/70 bg-white/72'
}

export function WorkoutDetailPage() {
  const history = useHistory()
  const { workoutId } = useParams<WorkoutDetailRouteParams>()
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null)

  const detailQuery = useQuery({
    queryKey: ['workouts', 'detail', workoutId],
    queryFn: () => workoutService.getWorkoutDetail(workoutId),
    staleTime: 10_000,
  })

  const workout = detailQuery.data
  const selectedExercise = workout?.exercises.find((exercise) => exercise.id === selectedExerciseId) ?? null

  function startWorkout() {
    history.push(studentRoutes.workoutSession, { workoutId })
  }

  if (detailQuery.isPending) {
    return (
      <section className="fq-page-shell space-y-5">
        <div className="h-[260px] animate-pulse rounded-[34px] border border-border/70 bg-white/60" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={`detail-skeleton-stat-${index}`} className="h-[138px] animate-pulse rounded-[28px] border border-border/70 bg-white/60" />
          ))}
        </div>
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.95fr)]">
          <div className="h-[560px] animate-pulse rounded-[30px] border border-border/70 bg-white/60" />
          <div className="space-y-5">
            <div className="h-[220px] animate-pulse rounded-[30px] border border-border/70 bg-white/60" />
            <div className="h-[320px] animate-pulse rounded-[30px] border border-border/70 bg-white/60" />
          </div>
        </div>
      </section>
    )
  }

  if (detailQuery.isError || !workout) {
    return (
      <section className="fq-page-shell-medium space-y-4">
        <FqAlert tone="danger" title="Treino não encontrado">
          Não foi possível abrir os detalhes deste treino.
        </FqAlert>
        <FqButton variant="outline" tone="neutral" onClick={() => history.push(studentRoutes.workouts)}>
          Voltar para Treinos
        </FqButton>
      </section>
    )
  }

  return (
    <section className="fq-page-shell space-y-5">
      <div className="fq-gradient-hero-mix overflow-hidden rounded-[36px] border border-border/70 bg-card p-6 shadow-[0_28px_72px_rgba(36,49,44,0.1)] md:p-8">
        <button
          type="button"
          onClick={() => history.push(studentRoutes.workouts)}
          className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/76 px-4 py-2 text-sm font-semibold text-foreground shadow-[0_10px_24px_rgba(36,49,44,0.08)] transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>

        <div className="mt-6 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className={cx('rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em]', getStatusClasses(workout.status))}>
                {workout.status === 'completed' ? 'concluido' : workout.status === 'late' ? 'atrasado' : 'programado'}
              </span>
              <span className="rounded-full bg-white/72 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {workout.intensity ?? 'ritmo guiado'}
              </span>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                {workout.scheduledWindowLabel}
              </p>
              <h1 className="fq-display text-4xl text-foreground md:text-5xl">
                {workout.title}
              </h1>
              <p className="max-w-3xl text-base leading-8 text-muted-foreground">
                {workout.personalNote}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-white/72 px-4 py-2 text-sm font-semibold text-foreground shadow-[0_10px_22px_rgba(36,49,44,0.05)]">
                {formatDate(workout.date, { weekday: 'long' })}
              </span>
              <span className="rounded-full bg-white/72 px-4 py-2 text-sm font-semibold text-foreground shadow-[0_10px_22px_rgba(36,49,44,0.05)]">
                {workout.exercises.length} exercicios
              </span>
              <span className="rounded-full bg-white/72 px-4 py-2 text-sm font-semibold text-foreground shadow-[0_10px_22px_rgba(36,49,44,0.05)]">
                +{workout.starsReward ?? 0} estrelas
              </span>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <FqButton variant="outline" tone="neutral" onClick={() => history.push(studentRoutes.workouts)}>
              Voltar para a agenda
            </FqButton>
            <FqButton leftIcon="play" onClick={startWorkout}>
              {workout.status === 'completed' ? 'Treinar novamente' : 'Iniciar treino'}
            </FqButton>
          </div>
        </div>
      </div>

      {workout.status === 'late' ? (
        <div className="rounded-[28px] border border-warning/30 bg-warning/10 px-5 py-4 text-sm font-medium text-warning-foreground">
          Este treino esta atrasado, mas ainda da para recuperar a aderencia iniciando agora.
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[28px] border border-border/70 bg-white/76 p-5 shadow-[0_18px_44px_rgba(36,49,44,0.06)]">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
            <Target className="h-5 w-5" />
          </div>
          <p className="mt-4 text-sm font-semibold text-muted-foreground">Aderencia</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground">{workout.adherencePct}%</p>
          <p className="mt-2 text-sm text-muted-foreground">{getAdherenceLabel(workout.adherencePct)}</p>
        </div>

        <div className="rounded-[28px] border border-border/70 bg-white/76 p-5 shadow-[0_18px_44px_rgba(36,49,44,0.06)]">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary/12 text-secondary">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <p className="mt-4 text-sm font-semibold text-muted-foreground">Execucoes</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground">{workout.completionCount}</p>
          <p className="mt-2 text-sm text-muted-foreground">Sessoes concluidas deste treino</p>
        </div>

        <div className="rounded-[28px] border border-border/70 bg-white/76 p-5 shadow-[0_18px_44px_rgba(36,49,44,0.06)]">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-tertiary/20 text-foreground">
            <Clock3 className="h-5 w-5" />
          </div>
          <p className="mt-4 text-sm font-semibold text-muted-foreground">Duracao</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground">{workout.estimatedDurationMin} min</p>
          <p className="mt-2 text-sm text-muted-foreground">Estimativa para executar com ritmo constante</p>
        </div>

        <div className="rounded-[28px] border border-border/70 bg-white/76 p-5 shadow-[0_18px_44px_rgba(36,49,44,0.06)]">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-warning/15 text-warning">
            <Trophy className="h-5 w-5" />
          </div>
          <p className="mt-4 text-sm font-semibold text-muted-foreground">Recompensa</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground">+{workout.starsReward ?? 0}</p>
          <p className="mt-2 text-sm text-muted-foreground">Estrelas liberadas ao concluir a sessao</p>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.95fr)]">
        <div className="overflow-hidden rounded-[32px] border border-border/70 bg-white/76 shadow-[0_22px_52px_rgba(36,49,44,0.08)]">
          <div className="border-b border-border/70 px-5 py-5 md:px-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                  Exercise flow
                </p>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  Ordem do treino
                </h2>
                <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                  Cada exercicio recebeu uma leitura visual nova para facilitar a execucao, revisar detalhes e entrar em sessao sem atrito.
                </p>
              </div>

              <div className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                {workout.exercises.length} blocos de execucao
              </div>
            </div>
          </div>

          <div className="space-y-4 px-5 py-5 md:px-6">
            {workout.exercises.map((exercise) => (
              <article
                key={exercise.id}
                className={cx(
                  'rounded-[28px] border p-4 shadow-[0_16px_40px_rgba(36,49,44,0.05)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_48px_rgba(36,49,44,0.08)] md:p-5',
                  getExerciseStatusClasses(exercise.status),
                )}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex gap-4">
                    <div className={cx(
                      'inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] text-base font-semibold',
                      exercise.status === 'done'
                        ? 'bg-primary text-primary-foreground'
                        : exercise.status === 'current'
                          ? 'bg-secondary text-secondary-foreground'
                          : 'bg-muted text-foreground',
                    )}>
                      {exercise.order}
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold tracking-tight text-foreground">
                            {exercise.name}
                          </h3>
                          <span className={cx(
                            'rounded-full px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.18em]',
                            exercise.status === 'done'
                              ? 'bg-primary/12 text-primary'
                              : exercise.status === 'current'
                                ? 'bg-secondary/14 text-secondary'
                                : 'bg-muted text-muted-foreground',
                          )}>
                            {exercise.status === 'done' ? 'feito' : exercise.status === 'current' ? 'agora' : 'proximo'}
                          </span>
                        </div>

                        <p className="text-sm leading-7 text-muted-foreground">
                          {exercise.note ?? 'Execucao limpa, ritmo constante e descanso respeitado.'}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-white/78 px-3 py-1.5 text-xs font-semibold text-foreground shadow-[0_8px_18px_rgba(36,49,44,0.05)]">
                          {exercise.sets} series
                        </span>
                        <span className="rounded-full bg-white/78 px-3 py-1.5 text-xs font-semibold text-foreground shadow-[0_8px_18px_rgba(36,49,44,0.05)]">
                          {exercise.reps} reps
                        </span>
                        <span className="rounded-full bg-white/78 px-3 py-1.5 text-xs font-semibold text-foreground shadow-[0_8px_18px_rgba(36,49,44,0.05)]">
                          {formatLoad(exercise.suggestedLoadKg)}
                        </span>
                        <span className="rounded-full bg-white/78 px-3 py-1.5 text-xs font-semibold text-foreground shadow-[0_8px_18px_rgba(36,49,44,0.05)]">
                          {exercise.restSec}s descanso
                        </span>
                        {exercise.muscleGroup ? (
                          <span className="rounded-full bg-white/78 px-3 py-1.5 text-xs font-semibold text-foreground shadow-[0_8px_18px_rgba(36,49,44,0.05)]">
                            {exercise.muscleGroup}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 md:justify-end">
                    <button
                      type="button"
                      onClick={() => setSelectedExerciseId(exercise.id)}
                      className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-white/78 px-4 py-2 text-sm font-semibold text-foreground shadow-[0_10px_24px_rgba(36,49,44,0.06)] transition hover:-translate-y-0.5 hover:border-primary/25 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Sparkles className="h-4 w-4" />
                      Detalhes
                    </button>

                    {exercise.supportMedia ? (
                      <a
                        href={exercise.supportMedia.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-white/78 px-4 py-2 text-sm font-semibold text-foreground shadow-[0_10px_24px_rgba(36,49,44,0.06)] transition hover:-translate-y-0.5 hover:border-destructive/25 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <PlayCircle className="h-4 w-4" />
                        Demo
                      </a>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-5">
          <div className="overflow-hidden rounded-[30px] border border-border/70 bg-white/76 p-5 shadow-[0_20px_48px_rgba(36,49,44,0.08)]">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Activity className="h-4 w-4 text-primary" />
              Leitura da sessao
            </div>

            <div className="mt-5 space-y-4">
              <div className="rounded-[24px] bg-muted/45 p-4">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Foco principal
                </p>
                <p className="mt-2 text-base font-semibold text-foreground">
                  {workout.focusLabel}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-[24px] bg-muted/45 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Dumbbell className="h-4 w-4 text-secondary" />
                    Volume
                  </div>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {workout.exercises.reduce((total, exercise) => total + exercise.sets, 0)} series no total
                  </p>
                </div>

                <div className="rounded-[24px] bg-muted/45 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Flame className="h-4 w-4 text-warning" />
                    Janela
                  </div>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {workout.scheduledWindowLabel}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[30px] border border-border/70 bg-white/76 p-5 shadow-[0_20px_48px_rgba(36,49,44,0.08)]">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Sparkles className="h-4 w-4 text-secondary" />
              Coach note
            </div>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              {workout.personalNote}
            </p>
          </div>

          <div className="overflow-hidden rounded-[30px] border border-border/70 bg-white/76 p-5 shadow-[0_20px_48px_rgba(36,49,44,0.08)]">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Trophy className="h-4 w-4 text-warning" />
              Historico recente
            </div>

            <div className="mt-5 space-y-3">
              {workout.recentHistory.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-border bg-muted/35 p-4 text-sm leading-7 text-muted-foreground">
                  As proximas sessoes concluidas vao aparecer aqui com horario, duracao e aderencia.
                </div>
              ) : (
                workout.recentHistory.map((entry) => (
                  <button
                    key={entry.sessionId}
                    type="button"
                    onClick={() => history.push(`${studentRoutes.workouts}/completed/${entry.sessionId}`)}
                    className="block w-full rounded-[24px] border border-border/70 bg-white/72 p-4 text-left shadow-[0_12px_28px_rgba(36,49,44,0.05)] transition hover:-translate-y-0.5 hover:border-primary/22 hover:shadow-[0_18px_36px_rgba(36,49,44,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{entry.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatDateTime(entry.completedAt)} • {formatDuration(entry.durationSec)}
                        </p>
                      </div>
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        {entry.adherencePct}%
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>

      <ExerciseInsightModal
        open={Boolean(selectedExercise)}
        exercise={selectedExercise}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedExerciseId(null)
          }
        }}
      />
    </section>
  )
}
