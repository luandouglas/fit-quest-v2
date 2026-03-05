export type GamificationBadge = {
  id: string
  title: string
  description: string
  icon: 'trophy' | 'star' | 'flame' | 'target'
  unlocked: boolean
}

export type GamificationHeatmapPoint = {
  date: string
  value: number
}

export type GamificationXpBreakdown = {
  workout: number
  nutrition: number
  hydration: number
  run: number
  professional: number
  mission: number
  total: number
}

export type GamificationMission = {
  id: string
  title: string
  description: string
  cadence: 'daily' | 'weekly'
  current: number
  target: number
  rewardXp: number
  rewardBadgeId?: string
  completed: boolean
}

export type GamificationAchievementCategory = 'WORKOUT' | 'NUTRITION' | 'HABIT' | 'RUN'

export type GamificationAchievement = GamificationBadge & {
  category: GamificationAchievementCategory
  requiredProgress?: number
  currentProgress?: number
}

export type GamificationXpLedgerEntry = {
  id: string
  title: string
  description: string
  eventType: 'workout' | 'run' | 'hydration' | 'nutrition' | 'mission' | 'bonus'
  xp: number
  occurredAt: string
}

export type GamificationOverview = {
  level: number
  totalXp: number
  currentLevelXp: number
  nextLevelXp: number
  weeklyStreak: number
  weeklyXp: number
  weeklyXpTarget: number
  todayXp: number
  xpBreakdown: GamificationXpBreakdown
  dailyMissions: GamificationMission[]
  weeklyMissions: GamificationMission[]
  dailyResetAt: string
  weeklyResetAt: string
  badges: GamificationBadge[]
  achievementsByCategory: Record<GamificationAchievementCategory, GamificationAchievement[]>
  xpLedger: GamificationXpLedgerEntry[]
  activityHeatmap: GamificationHeatmapPoint[]
}
