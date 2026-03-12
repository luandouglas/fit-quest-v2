import { FqCard, FqStatCard, FqTag, FqText } from '@/shared/ui'
import type { RunSession } from '@/shared/services/contracts/run'

type CardioSummaryCardProps = {
  session: RunSession
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

export function CardioSummaryCard({ session }: CardioSummaryCardProps) {
  return (
    <FqCard className="border-border bg-card">
      <div className="space-y-5">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <FqText as="p" className="text-sm text-muted-foreground">
                Atividade finalizada
              </FqText>
              <FqText as="h1" className="text-2xl font-semibold text-foreground">
                {session.activityType === 'run' ? 'Corrida concluída' : 'Caminhada concluída'}
              </FqText>
            </div>
            <FqTag tone="success">+{session.starsEarned} estrelas</FqTag>
          </div>

          <FqText as="p" className="text-sm text-muted-foreground">
            Seu cardio já entrou no ecossistema do dia e puxou progresso, recompensa e consistência.
          </FqText>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <FqStatCard label="Distância" value={`${session.distanceKm.toFixed(2)} km`} icon="mapPin" />
          <FqStatCard label="Duração" value={formatDuration(session.elapsedSec)} icon="clock" />
          <FqStatCard label="Ritmo médio" value={formatPace(session.paceSecPerKm)} icon="activity" />
          <FqStatCard label="Calorias" value={`${session.calories} kcal`} icon="flame" />
        </div>

        <div className="flex flex-wrap gap-2">
          <FqTag tone="secondary">{session.progressImpactPct}% de impacto no progresso do dia</FqTag>
          <FqTag tone="neutral">{session.source === 'manual' ? 'Registro manual' : 'Tracking por GPS'}</FqTag>
        </div>
      </div>
    </FqCard>
  )
}
