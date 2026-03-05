export type RankingPeriod = 'weekly' | 'monthly'
export type RankingScope = 'neighborhood' | 'city' | 'gym' | 'global'
export type RankingLeague = 'bronze' | 'silver' | 'gold'

export type RankingSummary = {
  points: number
  position: number
  totalAthletes: number
}

export type RankingAthlete = {
  id: string
  name: string
  avatarSeed: string
  city: string
  neighborhood: string
  gym: string
  league: RankingLeague
  xp: number
  position: number
  trend: 'up' | 'down' | 'same'
  isCurrentUser: boolean
}

export type RankingLeagueTransition = 'promoted' | 'relegated' | 'stayed'

export type RankingLeagueStatus = {
  current: RankingLeague
  previous: RankingLeague
  previousWeekXp: number
  transition: RankingLeagueTransition
  promotionRule: string
}

export type RankingLeaderboard = {
  period: RankingPeriod
  scope: RankingScope
  league: RankingLeague
  updatedAt: string
  currentUser: RankingAthlete
  rival: RankingAthlete | null
  rivalGapXp: number | null
  leagueStatus: RankingLeagueStatus
  leagues: RankingLeague[]
  top: RankingAthlete[]
  aroundUser: RankingAthlete[]
  totalAthletes: number
}
