import type { RankingSummary } from '@/shared/services/contracts/student'
import { FqCard, FqStatCard, FqTag, FqText } from '@/shared/ui'

type GamificationRankingSummaryCardProps = {
  ranking: RankingSummary | null
}

function resolveTrendTone(trend: RankingSummary['trend']) {
  if (trend === 'up') {
    return 'success'
  }

  if (trend === 'down') {
    return 'warning'
  }

  return 'secondary'
}

export function GamificationRankingSummaryCard({ ranking }: GamificationRankingSummaryCardProps) {
  if (!ranking) {
    return (
      <FqCard title="Ranking" subtitle="Resumo competitivo do aluno" className="border-border bg-card">
        <FqText as="p" className="text-sm text-muted-foreground">
          O ranking ainda esta sincronizando. Assim que os pontos forem consolidados, esta area mostra posicao, liga e distancia do proximo aluno.
        </FqText>
      </FqCard>
    )
  }

  return (
    <FqCard title="Ranking" subtitle="Competicao saudavel e leitura objetiva de posicao" className="border-border bg-card">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <FqTag tone="secondary">Liga {ranking.league}</FqTag>
          <FqTag tone={resolveTrendTone(ranking.trend)}>
            {ranking.trend === 'up' ? 'Em alta' : ranking.trend === 'down' ? 'Perdeu ritmo' : 'Estavel'}
          </FqTag>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <FqStatCard
            label="Posicao"
            value={`${ranking.position}º`}
            helperText={`Entre ${ranking.totalParticipants} alunos`}
            icon="trophy"
          />
          <FqStatCard
            label="Pontos"
            value={ranking.points}
            helperText={`Escopo ${ranking.scope} no periodo ${ranking.period}`}
            icon="chart"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[calc(var(--radius)+4px)] border border-border/75 bg-muted/20 p-4">
            <FqText as="p" className="text-xs text-muted-foreground">
              Gap para subir
            </FqText>
            <FqText as="p" className="mt-2 text-lg font-semibold text-foreground">
              {ranking.gapToNext > 0 ? `${ranking.gapToNext} pts` : 'Voce esta no topo'}
            </FqText>
          </div>
          <div className="rounded-[calc(var(--radius)+4px)] border border-border/75 bg-muted/20 p-4">
            <FqText as="p" className="text-xs text-muted-foreground">
              Ultima atualizacao
            </FqText>
            <FqText as="p" className="mt-2 text-lg font-semibold text-foreground">
              {new Date(ranking.lastUpdatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
            </FqText>
          </div>
        </div>
      </div>
    </FqCard>
  )
}
