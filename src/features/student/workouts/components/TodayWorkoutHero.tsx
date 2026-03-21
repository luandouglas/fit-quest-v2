import { FqButton, FqCard, FqIcon, FqProgressBar, FqTag, FqText } from '@/shared/ui'

import type { TodayWorkout } from '../types'

type TodayWorkoutHeroProps = {
  workout: TodayWorkout
  hasActiveSession?: boolean
  onStart: () => void
  onOpenDetails?: () => void
}

export function TodayWorkoutHero({
  workout,
  hasActiveSession = false,
  onStart,
  onOpenDetails,
}: TodayWorkoutHeroProps) {
  const hasWorkout = workout.durationMin > 0
  const primaryLabel = hasActiveSession ? 'Retomar sessão' : 'Iniciar treino'

  return (
    <FqCard className="border-border bg-card">
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <FqIcon name="dumbbell" size={12} />
              Rotina de hoje
            </p>
            <FqText as="h2" className="text-sm font-semibold text-foreground">
              {workout.title}
            </FqText>
            <FqText as="p" className="max-w-xl text-sm text-muted-foreground">
              {workout.estimatedStartLabel ?? 'Abra o treino e siga a execução com o menor atrito possível.'}
            </FqText>
          </div>

          <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
            {onOpenDetails ? (
              <FqButton variant="outline" tone="neutral" onClick={onOpenDetails} className="flex-1 sm:flex-none">
                Ver detalhes
              </FqButton>
            ) : null}
            <FqButton leftIcon="play" onClick={onStart} className="flex-1 sm:flex-none" isDisabled={!hasWorkout}>
              {primaryLabel}
            </FqButton>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <FqTag tone="neutral" leftIcon="clock" className="justify-center rounded-lg px-3 py-2 text-sm">
            {workout.durationMin} min
          </FqTag>
          <FqTag tone="neutral" leftIcon="flame" className="justify-center rounded-lg px-3 py-2 text-sm">
            {workout.calories} kcal
          </FqTag>
          <FqTag tone="neutral" leftIcon="star" className="justify-center rounded-lg px-3 py-2 text-sm text-star">
            +{workout.stars} estrelas
          </FqTag>
          <FqTag tone={workout.progressPct >= 100 ? 'success' : 'secondary'} leftIcon="target" className="justify-center rounded-lg px-3 py-2 text-sm">
            {workout.completedCount}/{workout.totalCount} feitos
          </FqTag>
        </div>

        {workout.muscleGroups?.length ? (
          <div className="flex flex-wrap gap-2">
            {workout.muscleGroups.map((group) => (
              <FqTag key={group} tone="neutral" className="rounded-full px-2.5 py-1 text-xs">
                {group}
              </FqTag>
            ))}
          </div>
        ) : null}

        <div className="space-y-2">
          <FqProgressBar value={workout.progressPct} tone="primary" showLabel />
          <p className="text-sm text-muted-foreground">
            {workout.progressPct >= 100
              ? 'Treino do dia concluído.'
              : workout.totalCount > 0
                ? `${workout.totalCount - workout.completedCount} exercícios ainda faltam para fechar o treino.`
                : 'Nenhum exercício carregado para hoje.'}
          </p>
        </div>
      </div>
    </FqCard>
  )
}
