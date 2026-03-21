import { FqButton, FqCard, FqTag, FqText } from '@/shared/ui'

import type { WorkoutHistoryEntry } from '../types'

type WorkoutHistoryCardProps = {
  history: WorkoutHistoryEntry[]
  onOpenCompletion?: (sessionId: string) => void
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
  const minutes = Math.max(Math.round(totalSec / 60), 1)
  return `${minutes} min`
}

export function WorkoutHistoryCard({ history, onOpenCompletion }: WorkoutHistoryCardProps) {
  return (
    <FqCard className="border-border bg-card">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <FqText as="h3" className="text-card-title font-semibold text-foreground">
              Histórico recente
            </FqText>
            <FqText as="p" className="text-sm text-muted-foreground">
              Veja aderência, duração e impacto das últimas sessões.
            </FqText>
          </div>
          <FqTag tone="neutral">{history.length} sessões</FqTag>
        </div>

        {history.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-4">
            <FqText as="p" className="text-sm text-muted-foreground">
              Seu histórico de treino aparece aqui assim que você concluir a primeira sessão.
            </FqText>
          </div>
        ) : (
          <ul className="space-y-3">
            {history.slice(0, 6).map((entry) => (
              <li key={entry.sessionId} className="rounded-2xl border border-border bg-background p-4">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <FqText as="p" className="text-sm font-semibold text-foreground">
                        {entry.title}
                      </FqText>
                      <FqText as="p" className="text-xs text-muted-foreground">
                        {formatDateTime(entry.completedAt)} • {formatDuration(entry.durationSec)}
                      </FqText>
                    </div>
                    <div className="flex items-center gap-2">
                      <FqTag tone="success">{entry.adherencePct}% aderência</FqTag>
                      <FqTag tone="neutral" className="text-star">
                        +{entry.rewardStars}
                      </FqTag>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <FqTag tone="neutral" className="rounded-full px-2.5 py-1 text-xs">
                      {entry.completedExercises}/{entry.totalExercises} exercícios
                    </FqTag>
                    <FqTag tone="neutral" className="rounded-full px-2.5 py-1 text-xs">
                      {entry.completedSets}/{entry.totalSets} séries
                    </FqTag>
                    {entry.muscleGroups.slice(0, 2).map((group) => (
                      <FqTag key={`${entry.sessionId}-${group}`} tone="neutral" className="rounded-full px-2.5 py-1 text-xs">
                        {group}
                      </FqTag>
                    ))}
                  </div>

                  {onOpenCompletion ? (
                    <FqButton size="sm" variant="outline" tone="neutral" onClick={() => onOpenCompletion(entry.sessionId)}>
                      Ver conclusão
                    </FqButton>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </FqCard>
  )
}
