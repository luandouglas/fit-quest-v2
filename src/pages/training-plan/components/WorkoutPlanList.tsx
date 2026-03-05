import { FqButton, FqCard, FqTag, FqText } from '@/shared/ui'
import type { WorkoutPlanItem } from '../types'

type WorkoutPlanListProps = {
  workouts: WorkoutPlanItem[]
  onStartSession: (workoutId?: string) => void
  onCreateQuickWorkout: () => void
  isCreatingQuickWorkout?: boolean
  canCreateQuickWorkout?: boolean
  quickWorkoutBlockedReason?: string
}

const statusToneMap = {
  completed: 'success',
  pending: 'secondary',
  late: 'warning',
} as const

const statusLabelMap = {
  completed: 'Concluido',
  pending: 'Pendente',
  late: 'Atrasado',
} as const

function formatDate(date: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  }).format(new Date(`${date}T12:00:00`))
}

export function WorkoutPlanList({
  workouts,
  onStartSession,
  onCreateQuickWorkout,
  isCreatingQuickWorkout = false,
  canCreateQuickWorkout = true,
  quickWorkoutBlockedReason,
}: WorkoutPlanListProps) {
  return (
    <FqCard className="border-border bg-card">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <FqText as="h3" className="text-lg font-semibold text-foreground">
            Treinos disponiveis
          </FqText>
          <FqButton
            size="sm"
            variant="outline"
            tone="secondary"
            leftIcon="plus"
            onClick={onCreateQuickWorkout}
            isLoading={isCreatingQuickWorkout}
            isDisabled={!canCreateQuickWorkout}
          >
            Criar treino rapido
          </FqButton>
        </div>
        {!canCreateQuickWorkout && quickWorkoutBlockedReason ? (
          <FqText as="p" className="text-xs text-muted-foreground">
            {quickWorkoutBlockedReason}
          </FqText>
        ) : null}

        {workouts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-accent/20 p-4">
            <FqText as="p" className="text-sm text-muted-foreground">
              Sem treino planejado para este dia.
            </FqText>
            <FqButton className="mt-3" size="sm" onClick={onCreateQuickWorkout} leftIcon="plus" isDisabled={!canCreateQuickWorkout}>
              Criar treino rapido
            </FqButton>
            {!canCreateQuickWorkout && quickWorkoutBlockedReason ? (
              <FqText as="p" className="mt-2 text-xs text-muted-foreground">
                {quickWorkoutBlockedReason}
              </FqText>
            ) : null}
          </div>
        ) : (
          <ul className="space-y-2">
            {workouts.map((workout) => (
              <li key={workout.id} className="rounded-xl border border-border bg-background p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <FqText as="p" className="text-sm font-semibold text-foreground">
                      {workout.title}
                    </FqText>
                    <FqText as="p" className="text-xs text-muted-foreground">
                      {formatDate(workout.date)} • {workout.estimatedDurationMin} min
                    </FqText>
                  </div>

                  <div className="flex items-center gap-2">
                    <FqTag tone={statusToneMap[workout.status]}>{statusLabelMap[workout.status]}</FqTag>
                    {workout.status === 'completed' ? (
                      <FqButton size="sm" variant="outline" tone="neutral" onClick={() => onStartSession(workout.id)}>
                        Repetir
                      </FqButton>
                    ) : (
                      <FqButton size="sm" leftIcon="play" onClick={() => onStartSession(workout.id)}>
                        Iniciar sessao
                      </FqButton>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </FqCard>
  )
}
