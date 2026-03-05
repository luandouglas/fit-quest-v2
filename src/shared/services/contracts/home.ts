export type DashboardTodayWorkout = {
  title: string
  durationMin: number
  hasWorkout: boolean
  activeSessionId?: string
}

export type DashboardMission = {
  id: string
  title: string
  current: number
  target: number
  status: 'active' | 'completed'
}

export type DashboardNotification = {
  id: string
  title: string
  description: string
  at: string
  type: 'workout' | 'nutrition' | 'hydration'
}

export type DashboardStreak = {
  kind: 'workout_or_hydration'
  days: number
  label: string
}

export type HomeDashboardOverview = {
  date: string
  summary: {
    todayWorkout: DashboardTodayWorkout
    waterConsumedMl: number
    waterGoalMl: number
    mealsLogged: number
    mealsTotal: number
    xpToday: number
  }
  quickActions: {
    canStartWorkout: boolean
    canRegisterMeal: boolean
    canRegisterWater: boolean
  }
  streak: DashboardStreak
  mission: DashboardMission
  latestNotification: DashboardNotification | null
}
