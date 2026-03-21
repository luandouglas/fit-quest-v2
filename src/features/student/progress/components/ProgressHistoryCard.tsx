import type { ProgressCardioHistoryEntry, WorkoutHistoryEntry } from '@/shared/services/contracts/progress'
import { FqCard, FqTag, FqText } from '@/shared/ui'

type ProgressHistoryCardProps = {
  workouts: WorkoutHistoryEntry[]
  cardio: ProgressCardioHistoryEntry[]
}

function formatDuration(durationSec: number) {
  return `${Math.round(durationSec / 60)} min`
}

function formatPace(paceSecPerKm: number) {
  if (!paceSecPerKm) {
    return 'Ritmo --'
  }

  const minutes = Math.floor(paceSecPerKm / 60)
  const seconds = String(Math.round(paceSecPerKm % 60)).padStart(2, '0')
  return `${minutes}:${seconds}/km`
}

export function ProgressHistoryCard({
  workouts,
  cardio,
}: ProgressHistoryCardProps) {
  return (
    <FqCard
      title="Historico recente"
      subtitle="Treino e cardio aparecem lado a lado para leitura de aderencia e desempenho."
      className="border-border bg-card"
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <FqText as="p" className="text-sm font-semibold text-foreground">
            Treinos recentes
          </FqText>
          <div className="space-y-2">
            {workouts.slice(0, 4).map((session) => (
              <div
                key={session.sessionId}
                className="rounded-xl border border-border/70 bg-muted/20 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <FqText as="p" className="text-sm font-semibold text-foreground">
                      {session.title}
                    </FqText>
                    <FqText as="p" className="text-xs text-muted-foreground">
                      {new Date(session.completedAt).toLocaleString('pt-BR')}
                    </FqText>
                  </div>
                  <FqTag tone="secondary">{formatDuration(session.durationSec)}</FqTag>
                </div>
                <FqText as="p" className="mt-2 text-xs text-muted-foreground">
                  Series {session.completedSets}/{session.totalSets}
                </FqText>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <FqText as="p" className="text-sm font-semibold text-foreground">
            Cardio recente
          </FqText>
          <div className="space-y-2">
            {cardio.slice(0, 4).map((session) => (
              <div
                key={session.sessionId}
                className="rounded-xl border border-border/70 bg-muted/20 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <FqText as="p" className="text-sm font-semibold text-foreground">
                      {session.title}
                    </FqText>
                    <FqText as="p" className="text-xs text-muted-foreground">
                      {new Date(session.completedAt).toLocaleString('pt-BR')}
                    </FqText>
                  </div>
                  <FqTag tone="success">{session.distanceKm.toFixed(1)} km</FqTag>
                </div>
                <FqText as="p" className="mt-2 text-xs text-muted-foreground">
                  {formatDuration(session.durationSec)} | {formatPace(session.paceSecPerKm)} | {session.starsEarned} estrelas
                </FqText>
              </div>
            ))}
          </div>
        </div>
      </div>
    </FqCard>
  )
}
