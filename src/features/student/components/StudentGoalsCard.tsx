import { FqCard, FqProgressBar, FqStatCard, FqTag, FqText } from '@/shared/ui'
import type { StudentGoal, StudentMetrics } from '@/shared/services/contracts/student'

type StudentGoalsCardProps = {
  goals: StudentGoal[]
  metrics: StudentMetrics
  highlightedGoalId: string | null
  onHighlightGoal: (goalId: string | null) => void
}

export function StudentGoalsCard({
  goals,
  metrics,
  highlightedGoalId,
  onHighlightGoal,
}: StudentGoalsCardProps) {
  return (
    <FqCard className="border-border bg-card">
      <div className="space-y-4">
        <div>
          <FqText as="h2" className="text-base font-semibold text-foreground">
            Metas e métricas do aluno
          </FqText>
          <FqText as="p" className="text-sm text-muted-foreground">
            Estrutura pronta para evolução de objetivos, check-ins e recomendações.
          </FqText>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <FqStatCard label="Treinos no mês" value={metrics.workoutsCompletedMonth} icon="dumbbell" />
          <FqStatCard label="Cardio no mês" value={`${metrics.cardioMinutesMonth} min`} icon="mapPin" />
          <FqStatCard label="Peso atual" value={`${metrics.currentWeightKg} kg`} icon="activity" />
          <FqStatCard label="Consistência" value={`${metrics.consistencyScore}%`} icon="flame" />
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          {goals.map((goal) => {
            const progress = Math.round((goal.current / Math.max(goal.target, 1)) * 100)
            const isHighlighted = highlightedGoalId === goal.id

            return (
              <button
                key={goal.id}
                type="button"
                className={[
                  'rounded-2xl border p-4 text-left transition',
                  isHighlighted ? 'border-primary bg-primary/5' : 'border-border bg-background',
                ].join(' ')}
                onClick={() => onHighlightGoal(isHighlighted ? null : goal.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <FqText as="p" className="text-sm font-semibold text-foreground">
                      {goal.title}
                    </FqText>
                    <FqText as="p" className="text-xs text-muted-foreground">
                      {goal.deadlineLabel}
                    </FqText>
                  </div>
                  <FqTag tone={goal.status === 'completed' ? 'success' : goal.status === 'on_track' ? 'primary' : 'warning'}>
                    {goal.status === 'completed' ? 'Concluída' : goal.status === 'on_track' ? 'No ritmo' : 'Atenção'}
                  </FqTag>
                </div>

                <div className="mt-3">
                  <FqProgressBar value={progress} tone={goal.status === 'completed' ? 'success' : 'primary'} />
                </div>

                <FqText as="p" className="mt-2 text-xs text-muted-foreground">
                  {goal.current}/{goal.target} {goal.unit}
                </FqText>
              </button>
            )
          })}
        </div>
      </div>
    </FqCard>
  )
}
