import { httpClient } from '@/shared/services/http'
import type { RankingLeaderboard, RankingLeague, RankingPeriod, RankingScope, RankingSummary } from '@/shared/services/contracts/ranking'

type GetLeaderboardFilters = {
  period?: RankingPeriod
  scope?: RankingScope
  league?: RankingLeague
}

export const rankingService = {
  async getSummary(): Promise<RankingSummary> {
    return httpClient.get<RankingSummary>('/ranking/summary')
  },
  async getLeaderboard({ period = 'weekly', scope = 'global', league = 'bronze' }: GetLeaderboardFilters = {}): Promise<RankingLeaderboard> {
    return httpClient.get<RankingLeaderboard>('/ranking/leaderboard', {
      query: { period, scope, league },
    })
  },
}
