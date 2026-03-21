import { FqButton, FqCard, FqTag, FqText } from '@/shared/ui'
import type { RankingSummary } from '@/shared/services/contracts/student'

type StudentRankingCardProps = {
  rankingSummary: RankingSummary
  onOpenRanking: () => void
}

export function StudentRankingCard({ rankingSummary, onOpenRanking }: StudentRankingCardProps) {
  return (
    <FqCard className="border-border bg-card">
      <div className="space-y-4">
        <div>
          <FqText as="h2" className="text-sm font-semibold text-foreground">
            Ranking competitivo
          </FqText>
          <FqText as="p" className="text-sm text-muted-foreground">
            Visão pronta para ligas, posição e disputa semanal.
          </FqText>
        </div>

        <div className="rounded-2xl border border-border bg-muted/10 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <FqText as="p" className="text-section-title font-semibold text-foreground">
                #{rankingSummary.position}
              </FqText>
              <FqText as="p" className="text-sm text-muted-foreground">
                entre {rankingSummary.totalParticipants} atletas
              </FqText>
            </div>
            <FqTag tone={rankingSummary.trend === 'up' ? 'success' : rankingSummary.trend === 'down' ? 'warning' : 'neutral'}>
              {rankingSummary.league} • {rankingSummary.period}
            </FqTag>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-background p-4">
            <FqText as="p" className="text-xs uppercase tracking-wide text-muted-foreground">
              Pontos
            </FqText>
            <FqText as="p" className="mt-1 text-sm font-semibold text-foreground">
              {rankingSummary.points}
            </FqText>
          </div>

          <div className="rounded-2xl border border-border bg-background p-4">
            <FqText as="p" className="text-xs uppercase tracking-wide text-muted-foreground">
              Gap para subir
            </FqText>
            <FqText as="p" className="mt-1 text-sm font-semibold text-foreground">
              {rankingSummary.gapToNext} XP
            </FqText>
          </div>
        </div>

        <FqText as="p" className="text-xs text-muted-foreground">
          Faltam {rankingSummary.gapToLeader} XP para alcançar a liderança da liga atual.
        </FqText>

        <FqButton variant="outline" tone="neutral" leftIcon="trophy" onClick={onOpenRanking}>
          Abrir ranking completo
        </FqButton>
      </div>
    </FqCard>
  )
}
