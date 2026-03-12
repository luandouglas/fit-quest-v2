import { FqButton, FqCard, FqTag, FqText } from '@/shared/ui'

import type { WorkoutDetail } from '../types'

type WorkoutDetailHeroProps = {
  workout: WorkoutDetail
  onBack: () => void
  onStart: () => void
}

export function WorkoutDetailHero({ workout, onBack, onStart }: WorkoutDetailHeroProps) {
  return (
    <FqCard className="border-border bg-card">
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <FqText as="p" className="text-sm text-muted-foreground">
              {workout.scheduledWindowLabel}
            </FqText>
            <FqText as="h1" className="text-2xl font-semibold text-foreground">
              {workout.title}
            </FqText>
            <FqText as="p" className="max-w-2xl text-sm text-muted-foreground">
              {workout.personalNote}
            </FqText>
          </div>

          <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
            <FqButton variant="outline" tone="neutral" onClick={onBack} className="flex-1 sm:flex-none">
              Voltar
            </FqButton>
            <FqButton leftIcon="play" onClick={onStart} className="flex-1 sm:flex-none">
              Iniciar treino
            </FqButton>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <FqTag tone="neutral">{workout.focusLabel}</FqTag>
          <FqTag tone="neutral">{workout.estimatedDurationMin} min</FqTag>
          <FqTag tone="neutral">{workout.exercises.length} exercícios</FqTag>
          <FqTag tone="neutral" className="text-star">
            +{workout.starsReward ?? 0} estrelas
          </FqTag>
          <FqTag tone={workout.status === 'completed' ? 'success' : workout.status === 'late' ? 'warning' : 'secondary'}>
            {workout.status === 'completed' ? 'Concluído' : workout.status === 'late' ? 'Atrasado' : 'Planejado'}
          </FqTag>
        </div>
      </div>
    </FqCard>
  )
}
