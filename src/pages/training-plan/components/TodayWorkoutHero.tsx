import { FqButton, FqCard, FqIcon, FqProgressBar, FqTag, FqText } from '@/shared/ui'

import type { TodayWorkout } from '../types'

type TodayWorkoutHeroProps = {
  workout: TodayWorkout
  onStart: () => void
}

export function TodayWorkoutHero({ workout, onStart }: TodayWorkoutHeroProps) {
  const hasWorkout = workout.durationMin > 0

  return (
    <FqCard className="border-border bg-card">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <FqIcon name="dumbbell" size={12} />
              Treino de hoje
            </p>
            <FqText as="h2" className="mt-1 text-lg font-semibold text-foreground">
              {workout.title}
            </FqText>
          </div>

          <FqButton leftIcon="play" onClick={onStart} className="w-full sm:w-auto" isDisabled={!hasWorkout}>
            Iniciar treino
          </FqButton>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <FqTag tone="neutral" leftIcon="clock" className="justify-center rounded-lg px-3 py-2 text-sm">
            {workout.durationMin} min
          </FqTag>
          <FqTag tone="neutral" leftIcon="flame" className="justify-center rounded-lg px-3 py-2 text-sm">
            {workout.calories} kcal
          </FqTag>
          <FqTag tone="neutral" leftIcon="star" className="justify-center rounded-lg px-3 py-2 text-sm text-star">
            +{workout.stars} estrelas
          </FqTag>
        </div>

        <FqProgressBar value={workout.progressPct} tone="primary" showLabel={false} />

        <p className="text-sm text-muted-foreground">
          {workout.completedCount}/{workout.totalCount} exercícios concluídos
        </p>
      </div>
    </FqCard>
  )
}
