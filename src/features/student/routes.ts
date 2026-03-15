export const studentRoutes = {
  hub: '/tabs/student',
  legacyHome: '/tabs/home',
  workouts: '/tabs/workouts',
  workoutSession: '/tabs/workouts/session',
  workoutCompletionBase: '/tabs/workouts/completed',
  workoutLogCreate: '/tabs/student/workout-log/create',
  cardio: '/tabs/run',
  cardioSession: '/tabs/run/session',
  cardioSummaryBase: '/tabs/run/completed',
  nutrition: '/tabs/nutrition',
  waterLogCreate: '/tabs/student/water-log/create',
  mealLogCreate: '/tabs/student/meal-log/create',
  progress: '/tabs/progress',
  rewards: '/tabs/gamification',
  ranking: '/tabs/ranking',
  notifications: '/tabs/notifications',
  profile: '/tabs/profile',
} as const

export type StudentRoutePath = (typeof studentRoutes)[keyof typeof studentRoutes]
