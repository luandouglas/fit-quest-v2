import { FqButton, FqCard, FqTag, FqText } from '@/shared/ui'
import type { RunActivityType, RunOverview } from '@/shared/services/contracts/run'

type CardioHeroCardProps = {
  overview: RunOverview
  selectedActivityType: RunActivityType
  onSelectActivityType: (value: RunActivityType) => void
  onStart: () => void
  onResume?: () => void
  isStarting?: boolean
}

export function CardioHeroCard({
  overview,
  selectedActivityType,
  onSelectActivityType,
  onStart,
  onResume,
  isStarting = false,
}: CardioHeroCardProps) {
  const hasActiveSession = Boolean(overview.activeSession)

  return (
    <FqCard className="border-border bg-card">
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <FqText as="p" className="text-sm text-muted-foreground">
              Cardio do aluno
            </FqText>
            <FqText as="h1" className="text-screen-title font-semibold text-foreground">
              Corrida e caminhada contam de verdade no seu progresso
            </FqText>
            <FqText as="p" className="max-w-2xl text-sm text-muted-foreground">
              Abra a atividade, acompanhe o cardio em tempo real e transforme distância em estrelas, streak e evolução diária.
            </FqText>
          </div>

          <div className="flex flex-wrap gap-2">
            {hasActiveSession && onResume ? (
              <FqButton variant="outline" tone="neutral" onClick={onResume}>
                Retomar atividade
              </FqButton>
            ) : null}
            <FqButton leftIcon="play" onClick={onStart} isLoading={isStarting}>
              Iniciar {selectedActivityType === 'run' ? 'corrida' : 'caminhada'}
            </FqButton>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {(['run', 'walk'] as const).map((type) => (
            <FqButton
              key={type}
              variant={selectedActivityType === type ? 'solid' : 'outline'}
              tone={selectedActivityType === type ? 'primary' : 'neutral'}
              onClick={() => onSelectActivityType(type)}
            >
              {type === 'run' ? 'Corrida' : 'Caminhada'}
            </FqButton>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <FqTag tone="neutral">Meta sugerida: {overview.recommendedGoalKm.toFixed(1)} km</FqTag>
          <FqTag tone="secondary">Hoje: {overview.todayDistanceKm.toFixed(2)} km</FqTag>
          <FqTag tone="success">+{overview.todayStars} estrelas no cardio hoje</FqTag>
        </div>
      </div>
    </FqCard>
  )
}
