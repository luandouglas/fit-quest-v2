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

export type GamificationOverview = {
  level: number
  currentLevelXp: number
  nextLevelXp: number
  weeklyStreak: number
  weeklyXp: number
  weeklyXpTarget: number
  badges: GamificationBadge[]
  activityHeatmap: GamificationHeatmapPoint[]
}
