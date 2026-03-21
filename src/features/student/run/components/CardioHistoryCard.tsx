import { FqButton, FqCard, FqTag, FqText } from '@/shared/ui'
import type { RunSession } from '@/shared/services/contracts/run'

type CardioHistoryCardProps = {
  history: RunSession[]
  onOpenSummary?: (sessionId: string) => void
}

function formatDuration(totalSec: number) {
  const hours = Math.floor(totalSec / 3600)
  const minutes = Math.floor((totalSec % 3600) / 60)
  const seconds = totalSec % 60

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function formatPace(paceSecPerKm: number) {
  if (paceSecPerKm <= 0) {
    return '--:-- /km'
  }

  const minutes = Math.floor(paceSecPerKm / 60)
  const seconds = paceSecPerKm % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} /km`
}

export function CardioHistoryCard({ history, onOpenSummary }: CardioHistoryCardProps) {
  return (
    <FqCard className="border-border bg-card">
      <div className="space-y-4">
        <div>
          <FqText as="h2" className="text-card-title font-semibold text-foreground">
            Histórico de cardio
          </FqText>
          <FqText as="p" className="text-sm text-muted-foreground">
            Corridas e caminhadas recentes com impacto em ritmo, calorias e estrelas.
          </FqText>
        </div>

        {history.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/25 p-4">
            <FqText as="p" className="text-sm text-muted-foreground">
              Seu histórico aparece aqui assim que a primeira atividade for finalizada.
            </FqText>
          </div>
        ) : (
          <ul className="space-y-3">
            {history.slice(0, 8).map((session) => (
              <li key={session.sessionId} className="rounded-2xl border border-border bg-background p-4">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <FqText as="p" className="text-sm font-semibold text-foreground">
                        {session.activityType === 'run' ? 'Corrida' : 'Caminhada'}
                      </FqText>
                      <FqText as="p" className="text-xs text-muted-foreground">
                        {new Intl.DateTimeFormat('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        }).format(new Date(session.endedAt ?? session.startedAt))}
                      </FqText>
                    </div>
                    <div className="flex items-center gap-2">
                      <FqTag tone="neutral">{session.distanceKm.toFixed(2)} km</FqTag>
                      <FqTag tone="success">+{session.starsEarned}</FqTag>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <FqTag tone="neutral">{formatDuration(session.elapsedSec)}</FqTag>
                    <FqTag tone="neutral">{formatPace(session.paceSecPerKm)}</FqTag>
                    <FqTag tone="neutral">{session.calories} kcal</FqTag>
                    <FqTag tone="secondary">{session.progressImpactPct}% no dia</FqTag>
                  </div>

                  {onOpenSummary ? (
                    <FqButton size="sm" variant="outline" tone="neutral" onClick={() => onOpenSummary(session.sessionId)}>
                      Ver resumo
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
