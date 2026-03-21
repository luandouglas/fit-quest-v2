import { FqButton, FqCard, FqProgressBar, FqTag, FqText } from '@/shared/ui'
import type { StudentDashboard } from '@/shared/services/contracts/student'
import { canStudentStartWorkout, isStudentWorkoutExpired } from '@/shared/utils'

type StudentWorkoutTodayCardProps = {
  dashboard: StudentDashboard
  onOpenWorkout: () => void
}

export function StudentWorkoutTodayCard({ dashboard, onOpenWorkout }: StudentWorkoutTodayCardProps) {
  const workout = dashboard.todayWorkout

  if (!workout) {
    return (
      <FqCard className="border-border bg-card">
        <FqText as="h2" className="text-sm font-semibold text-foreground">
          Treino do dia
        </FqText>
        <FqText as="p" className="mt-2 text-sm text-muted-foreground">
          Nenhum treino prescrito hoje. Use o dia para recuperar ou abrir um treino livre.
        </FqText>
      </FqCard>
    )
  }

  const canOpenWorkoutSession = canStudentStartWorkout(workout.status)
  const isExpiredWorkout = isStudentWorkoutExpired(workout.status)

  return (
    <FqCard className="border-border bg-card">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <FqText as="h2" className="text-sm font-semibold text-foreground">
              Treino do dia
            </FqText>
            <FqText as="p" className="text-sm text-muted-foreground">
              {workout.title}
            </FqText>
          </div>
          <FqTag tone={workout.status === 'completed' ? 'success' : workout.status === 'in_progress' ? 'primary' : 'warning'}>
            {workout.status === 'completed'
              ? 'Concluído'
              : workout.status === 'in_progress'
                ? 'Em execução'
                : isExpiredWorkout
                  ? 'Expirado'
                  : 'Pendente'}
          </FqTag>
        </div>

        <div className="rounded-2xl border border-border bg-background p-4">
          <div className="flex flex-wrap items-center gap-2">
            <FqTag tone="secondary">{workout.focus}</FqTag>
            <FqTag tone="neutral">{workout.estimatedDurationMin} min</FqTag>
            <FqTag tone="warning">{workout.rewardStars} estrelas</FqTag>
          </div>
          <div className="mt-3">
            <FqProgressBar value={workout.completionPct} tone={workout.status === 'completed' ? 'success' : 'primary'} />
          </div>
          <FqText as="p" className="mt-2 text-xs text-muted-foreground">
            {workout.exercises.length} exercícios planejados para hoje.
          </FqText>
        </div>

        <div className="space-y-2">
          {workout.exercises.slice(0, 4).map((exercise) => (
            <div key={exercise.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-background px-4 py-3">
              <div>
                <FqText as="p" className="text-sm font-semibold text-foreground">
                  {exercise.name}
                </FqText>
                <FqText as="p" className="text-xs text-muted-foreground">
                  {exercise.sets}x{exercise.reps} • {exercise.group}
                </FqText>
              </div>
              <FqTag tone={exercise.status === 'completed' ? 'success' : exercise.status === 'current' ? 'primary' : 'neutral'}>
                {exercise.status === 'completed' ? 'Feito' : exercise.status === 'current' ? 'Agora' : 'Depois'}
              </FqTag>
            </div>
          ))}
        </div>

        <FqButton leftIcon="play" onClick={onOpenWorkout} isDisabled={!canOpenWorkoutSession}>
          {workout.status === 'completed'
            ? 'Revisar treino'
            : workout.status === 'in_progress'
              ? 'Voltar para treino'
              : isExpiredWorkout
                ? 'Treino expirado'
                : 'Iniciar treino'}
        </FqButton>
      </div>
    </FqCard>
  )
}
