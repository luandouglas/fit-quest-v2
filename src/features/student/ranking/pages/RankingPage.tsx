import { useMemo, useState } from 'react'

import { FqAlert, FqAvatar, FqButton, FqCard, FqEmptyState, FqTag, FqText } from '@/shared/ui'
import type { RankingLeague, RankingPeriod, RankingScope } from '@/shared/services'

import { useRankingLeaderboard } from '../hooks/useRankingLeaderboard'

const periodOptions: Array<{ value: RankingPeriod; label: string }> = [
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensal' },
]

const scopeOptions: Array<{ value: RankingScope; label: string }> = [
  { value: 'neighborhood', label: 'Bairro' },
  { value: 'city', label: 'Cidade' },
  { value: 'gym', label: 'Academia' },
  { value: 'global', label: 'Global' },
]

const leagueOptions: Array<{ value: RankingLeague; label: string }> = [
  { value: 'bronze', label: 'Bronze' },
  { value: 'silver', label: 'Prata' },
  { value: 'gold', label: 'Ouro' },
]

function trendLabel(trend: 'up' | 'down' | 'same') {
  if (trend === 'up') {
    return '↑'
  }

  if (trend === 'down') {
    return '↓'
  }

  return '→'
}

export function RankingPage() {
  const [period, setPeriod] = useState<RankingPeriod>('weekly')
  const [scope, setScope] = useState<RankingScope>('city')
  const [league, setLeague] = useState<RankingLeague>('bronze')
  const { leaderboard, uiState, refresh, error } = useRankingLeaderboard(period, scope, league)

  const topRows = useMemo(() => leaderboard?.top.slice(0, 20) ?? [], [leaderboard?.top])

  if (uiState === 'loading') {
    return (
      <section className="fq-page-shell">
        <FqCard className="border-border bg-card">
          <FqText as="h1" variant="title">
            Carregando ranking...
          </FqText>
        </FqCard>
      </section>
    )
  }

  if (uiState === 'error') {
    return (
      <section className="fq-page-shell">
        <FqAlert tone="danger" title="Falha ao carregar ranking">
          {error instanceof Error ? error.message : 'Nao foi possivel carregar o ranking agora.'}
        </FqAlert>
        <FqButton onClick={() => void refresh()} variant="outline" tone="neutral">
          Tentar novamente
        </FqButton>
      </section>
    )
  }

  if (uiState === 'empty' || !leaderboard) {
    return (
      <section className="fq-page-shell">
        <FqEmptyState icon="trophy" title="Sem ranking disponivel" description="Ganhe XP para entrar no ranking." />
      </section>
    )
  }

  return (
    <section className="fq-page-shell">
      <header className="fq-page-header">
        <FqText as="h1" variant="title">
          Ranking
        </FqText>
        <FqText as="p" className="text-sm text-muted-foreground">
          Segmentado por bairro, cidade, academia e ligas com promocao/rebaixamento.
        </FqText>
        <div className="flex flex-wrap gap-2">
          {periodOptions.map((option) => (
            <FqButton
              key={option.value}
              size="sm"
              variant={period === option.value ? 'solid' : 'outline'}
              tone={period === option.value ? 'primary' : 'neutral'}
              onClick={() => setPeriod(option.value)}
            >
              {option.label}
            </FqButton>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {scopeOptions.map((option) => (
            <FqButton
              key={option.value}
              size="sm"
              variant={scope === option.value ? 'solid' : 'outline'}
              tone={scope === option.value ? 'secondary' : 'neutral'}
              onClick={() => setScope(option.value)}
            >
              {option.label}
            </FqButton>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {leagueOptions.map((option) => (
            <FqButton
              key={option.value}
              size="sm"
              variant={league === option.value ? 'solid' : 'outline'}
              tone={league === option.value ? 'primary' : 'neutral'}
              onClick={() => setLeague(option.value)}
            >
              Liga {option.label}
            </FqButton>
          ))}
        </div>
        {leaderboard && league !== leaderboard.leagueStatus.current ? (
          <div className="flex items-center gap-2">
            <FqTag tone="warning">Sua liga atual: {leaderboard.leagueStatus.current.toUpperCase()}</FqTag>
            <FqButton size="sm" variant="outline" tone="neutral" onClick={() => setLeague(leaderboard.leagueStatus.current)}>
              Ir para minha liga
            </FqButton>
          </div>
        ) : null}
      </header>

      <div className="grid gap-4 lg:grid-cols-12">
        <FqCard className="border-border bg-card lg:col-span-4">
          <div className="space-y-3">
            <FqText as="h2" className="text-sm font-semibold text-foreground">
              Sua posicao
            </FqText>
            <div className="flex items-center gap-3 rounded-xl border border-primary/25 bg-primary/10 p-3">
              <FqAvatar name={leaderboard.currentUser.name} size="md" />
              <div className="min-w-0 flex-1">
                <FqText as="p" className="truncate text-sm font-semibold text-foreground">
                  {leaderboard.currentUser.name}
                </FqText>
                <FqText as="p" className="text-xs text-muted-foreground">
                  #{leaderboard.currentUser.position} de {leaderboard.totalAthletes}
                </FqText>
                <FqText as="p" className="text-xs text-muted-foreground">
                  {leaderboard.currentUser.neighborhood}, {leaderboard.currentUser.city} • {leaderboard.currentUser.gym}
                </FqText>
              </div>
              <FqTag tone="primary">{leaderboard.currentUser.xp} XP</FqTag>
            </div>
            <div className="rounded-xl border border-border bg-muted/20 p-3">
              <FqText as="p" className="text-xs text-muted-foreground">Liga atual</FqText>
              <FqText as="p" className="text-sm font-semibold text-foreground">
                {leaderboard.leagueStatus.current.toUpperCase()} ({leaderboard.leagueStatus.previousWeekXp} XP semana passada)
              </FqText>
              <FqText as="p" className="text-xs text-muted-foreground">{leaderboard.leagueStatus.promotionRule}</FqText>
              <FqTag tone={leaderboard.leagueStatus.transition === 'promoted' ? 'success' : leaderboard.leagueStatus.transition === 'relegated' ? 'danger' : 'neutral'}>
                {leaderboard.leagueStatus.transition === 'promoted' ? 'Promovido' : leaderboard.leagueStatus.transition === 'relegated' ? 'Rebaixado' : 'Manteve liga'}
              </FqTag>
            </div>
            <div className="rounded-xl border border-border bg-muted/20 p-3">
              <FqText as="p" className="text-xs text-muted-foreground">Rival mais proximo</FqText>
              {leaderboard.rival ? (
                <div className="mt-2 flex items-center gap-3">
                  <FqAvatar name={leaderboard.rival.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <FqText as="p" className="truncate text-sm font-semibold text-foreground">
                      {leaderboard.rival.name}
                    </FqText>
                    <FqText as="p" className="text-xs text-muted-foreground">
                      #{leaderboard.rival.position} • diferenca {leaderboard.rivalGapXp ?? 0} XP
                    </FqText>
                  </div>
                </div>
              ) : (
                <FqText as="p" className="mt-2 text-xs text-muted-foreground">Sem rival neste recorte.</FqText>
              )}
            </div>
            <FqText as="p" className="text-xs text-muted-foreground">
              Atualizado em {new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date(leaderboard.updatedAt))}
            </FqText>
          </div>
        </FqCard>

        <FqCard className="border-border bg-card lg:col-span-8">
          <div className="space-y-3">
            <FqText as="h2" className="text-sm font-semibold text-foreground">
              Top atletas ({period === 'weekly' ? 'semana' : 'mes'}) • {scopeOptions.find((item) => item.value === scope)?.label}
            </FqText>
            <div className="space-y-2">
              {topRows.map((athlete) => (
                <div
                  key={athlete.id}
                  className={[
                    'flex items-center gap-3 rounded-lg border px-3 py-2.5',
                    athlete.isCurrentUser ? 'border-primary/30 bg-primary/10' : 'border-border bg-muted/20',
                  ].join(' ')}
                >
                  <FqText as="p" className="w-8 shrink-0 text-sm font-semibold text-muted-foreground">
                    #{athlete.position}
                  </FqText>
                  <FqAvatar name={athlete.name} size="sm" />
                  <FqText as="p" className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                    {athlete.name}
                  </FqText>
                  <FqText as="p" className="hidden w-44 truncate text-xs text-muted-foreground lg:block">
                    {athlete.neighborhood}, {athlete.city} • {athlete.gym}
                  </FqText>
                  <FqTag tone={athlete.trend === 'up' ? 'success' : athlete.trend === 'down' ? 'danger' : 'neutral'}>
                    {trendLabel(athlete.trend)}
                  </FqTag>
                  <FqText as="p" className="w-20 text-right text-sm font-semibold text-foreground">
                    {athlete.xp}
                  </FqText>
                </div>
              ))}
            </div>
          </div>
        </FqCard>
      </div>

      <FqCard className="border-border bg-card">
        <div className="space-y-3">
          <FqText as="h2" className="text-sm font-semibold text-foreground">
            Janela ao redor da sua posicao
          </FqText>
          <div className="space-y-2">
            {leaderboard.aroundUser.map((athlete) => (
              <div
                key={athlete.id}
                className={[
                  'flex items-center gap-3 rounded-lg border px-3 py-2.5',
                  athlete.isCurrentUser ? 'border-primary/30 bg-primary/10' : 'border-border bg-muted/20',
                ].join(' ')}
              >
                <FqText as="p" className="w-8 shrink-0 text-sm font-semibold text-muted-foreground">
                  #{athlete.position}
                </FqText>
                <FqAvatar name={athlete.name} size="sm" />
                <FqText as="p" className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                  {athlete.name}
                </FqText>
                <FqText as="p" className="w-20 text-right text-sm font-semibold text-foreground">
                  {athlete.xp}
                </FqText>
              </div>
            ))}
          </div>
        </div>
      </FqCard>
    </section>
  )
}
