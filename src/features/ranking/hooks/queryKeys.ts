import type { RankingLeague, RankingPeriod, RankingScope } from '@/shared/services'

export const rankingQueryKeys = {
  root: ['ranking'] as const,
  leaderboard: (period: RankingPeriod, scope: RankingScope, league: RankingLeague) =>
    ['ranking', 'leaderboard', period, scope, league] as const,
}
