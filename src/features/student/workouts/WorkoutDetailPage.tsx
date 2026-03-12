import { useMemo } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import { studentRoutes } from '@/features/student/routes'
import { workoutService } from '@/shared/services'
import { FqAlert, FqButton, FqCard, FqLoadingSpinner, FqStatCard, FqTag, FqText } from '@/shared/ui'

import { WorkoutDetailHero, WorkoutHistoryCard } from './components'

type WorkoutDetailRouteParams = {
  workoutId: string
}

export function WorkoutDetailPage() {
  const history = useHistory()
  const { workoutId } = useParams<WorkoutDetailRouteParams>()

  const detailQuery = useQuery({
    queryKey: ['workouts', 'detail', workoutId],
    queryFn: () => workoutService.getWorkoutDetail(workoutId),
    staleTime: 10_000,
  })

  const workout = detailQuery.data
  const adherenceLabel = useMemo(() => {
    if (!workout) {
      return 'Sem histórico ainda'
    }

    if (workout.adherencePct >= 90) {
      return 'Aderência alta'
    }

    if (workout.adherencePct >= 60) {
      return 'Boa consistência'
    }

    return 'Precisa ganhar ritmo'
  }, [workout])

  function startWorkout() {
    history.push(studentRoutes.workoutSession, { workoutId })
  }

  if (detailQuery.isPending) {
    return (
      <section className="fq-page-shell-medium">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
          <FqLoadingSpinner size="md" />
          <FqText as="p" className="text-sm text-muted-foreground">
            Carregando treino...
          </FqText>
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
      <WorkoutDetailHero workout={workout} onBack={() => history.push(studentRoutes.workouts)} onStart={startWorkout} />

      {workout.status === 'late' ? (
        <FqAlert tone="warning" title="Treino com atraso">
          Você ainda pode recuperar a aderência iniciando este treino agora.
        </FqAlert>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <FqStatCard label="Aderência" value={`${workout.adherencePct}%`} helperText={adherenceLabel} icon="chart" />
        <FqStatCard label="Execuções" value={workout.completionCount} helperText="sessões concluídas deste treino" icon="check" />
        <FqStatCard label="Duração" value={`${workout.estimatedDurationMin} min`} helperText="estimativa para hoje" icon="clock" />
        <FqStatCard label="Recompensa" value={`+${workout.starsReward ?? 0}`} helperText="estrelas ao concluir" icon="star" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,1fr)]">
        <FqCard className="border-border bg-card">
          <div className="space-y-4">
            <div>
              <FqText as="h2" className="text-lg font-semibold text-foreground">
                Exercícios do treino
              </FqText>
              <FqText as="p" className="text-sm text-muted-foreground">
                Tudo o que você vai executar nesta sessão, com descanso e observações do personal.
              </FqText>
            </div>

            <div className="space-y-3">
              {workout.exercises.map((exercise) => (
                <article key={exercise.id} className="rounded-2xl border border-border bg-background p-4">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <FqText as="p" className="text-sm font-semibold text-foreground">
                          {exercise.order}. {exercise.name}
                        </FqText>
                        <FqText as="p" className="text-xs text-muted-foreground">
                          {exercise.sets} séries x {exercise.reps} repetições • descanso de {exercise.restSec}s
                        </FqText>
                      </div>

                      <div className="flex items-center gap-2">
                        <FqTag tone={exercise.status === 'done' ? 'success' : exercise.status === 'current' ? 'secondary' : 'neutral'}>
                          {exercise.status === 'done' ? 'Concluído' : exercise.status === 'current' ? 'Atual' : 'Planejado'}
                        </FqTag>
                        {exercise.supportMedia ? <FqTag tone="neutral">Mídia futura</FqTag> : null}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {exercise.muscleGroup ? <FqTag tone="neutral">{exercise.muscleGroup}</FqTag> : null}
                      {exercise.equipment ? <FqTag tone="neutral">{exercise.equipment}</FqTag> : null}
                      {exercise.suggestedLoadKg ? <FqTag tone="neutral">{exercise.suggestedLoadKg} kg sugeridos</FqTag> : null}
                      <FqTag tone="neutral">{exercise.durationMin} min</FqTag>
                    </div>

                    {exercise.note ? (
                      <div className="rounded-2xl bg-muted/40 p-3">
                        <FqText as="p" className="text-sm text-muted-foreground">
                          {exercise.note}
                        </FqText>
                      </div>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </FqCard>

        <WorkoutHistoryCard history={workout.recentHistory} />
      </div>
    </section>
  )
}
