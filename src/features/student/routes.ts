export const studentRoutes = {
  hub: '/tabs/student',
  legacyHome: '/tabs/home',
  workouts: '/tabs/workouts',
  workoutSession: '/tabs/workouts/session',
  workoutCompletionBase: '/tabs/workouts/completed',
  cardio: '/tabs/run',
  cardioSession: '/tabs/run/session',
  cardioSummaryBase: '/tabs/run/completed',
  nutrition: '/tabs/nutrition',
  progress: '/tabs/progress',
  rewards: '/tabs/gamification',
  ranking: '/tabs/ranking',
  notifications: '/tabs/notifications',
  profile: '/tabs/profile',
} as const

export type StudentRoutePath = (typeof studentRoutes)[keyof typeof studentRoutes]
