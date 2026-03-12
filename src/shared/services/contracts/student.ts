import type { ProfilePreferences } from '@/shared/services/contracts/profile'

type ValueOf<T> = T[keyof T]

export const dailyProgressStatuses = {
  notStarted: 'not_started',
  inProgress: 'in_progress',
  completed: 'completed',
  missed: 'missed',
} as const

export type DailyProgressStatus = ValueOf<typeof dailyProgressStatuses>

export const workoutDayStatuses = {
  scheduled: 'scheduled',
  inProgress: 'in_progress',
  completed: 'completed',
  skipped: 'skipped',
  restDay: 'rest_day',
} as const

export type WorkoutDayStatus = ValueOf<typeof workoutDayStatuses>

export const workoutExerciseStatuses = {
  pending: 'pending',
  current: 'current',
  completed: 'completed',
  skipped: 'skipped',
} as const

export type WorkoutExerciseStatus = ValueOf<typeof workoutExerciseStatuses>

export const cardioSessionStatuses = {
  scheduled: 'scheduled',
  inProgress: 'in_progress',
  completed: 'completed',
  skipped: 'skipped',
} as const

export type CardioSessionStatus = ValueOf<typeof cardioSessionStatuses>

export const nutritionDayPlanStatuses = {
  planned: 'planned',
  inProgress: 'in_progress',
  completed: 'completed',
  partial: 'partial',
} as const

export type NutritionDayPlanStatus = ValueOf<typeof nutritionDayPlanStatuses>

export const nutritionMealStatuses = {
  pending: 'pending',
  completed: 'completed',
  skipped: 'skipped',
} as const

export type NutritionMealStatus = ValueOf<typeof nutritionMealStatuses>

export const waterProgressStatuses = {
  empty: 'empty',
  inProgress: 'in_progress',
  completed: 'completed',
} as const

export type WaterProgressStatus = ValueOf<typeof waterProgressStatuses>

export const habitStatuses = {
  pending: 'pending',
  inProgress: 'in_progress',
  completed: 'completed',
  skipped: 'skipped',
} as const

export type HabitStatus = ValueOf<typeof habitStatuses>

export const streakStatuses = {
  cold: 'cold',
  building: 'building',
  hot: 'hot',
  broken: 'broken',
} as const

export type StreakStatus = ValueOf<typeof streakStatuses>

export const achievementStatuses = {
  locked: 'locked',
  inProgress: 'in_progress',
  unlocked: 'unlocked',
} as const

export type AchievementStatus = ValueOf<typeof achievementStatuses>

export const achievementCategories = {
  workout: 'workout',
  nutrition: 'nutrition',
  hydration: 'hydration',
  consistency: 'consistency',
  ranking: 'ranking',
} as const

export type AchievementCategory = ValueOf<typeof achievementCategories>

export const rankingTrends = {
  up: 'up',
  down: 'down',
  stable: 'stable',
} as const

export type RankingTrend = ValueOf<typeof rankingTrends>

export const studentGoalStatuses = {
  onTrack: 'on_track',
  atRisk: 'at_risk',
  completed: 'completed',
  paused: 'paused',
} as const

export type StudentGoalStatus = ValueOf<typeof studentGoalStatuses>

export const studentGoalTypes = {
  workout: 'workout',
  nutrition: 'nutrition',
  hydration: 'hydration',
  cardio: 'cardio',
  recovery: 'recovery',
  bodyComposition: 'body_composition',
} as const

export type StudentGoalType = ValueOf<typeof studentGoalTypes>

export const studentRankingScopes = {
  gym: 'gym',
  city: 'city',
  global: 'global',
} as const

export type StudentRankingScope = ValueOf<typeof studentRankingScopes>

export const studentRankingPeriods = {
  weekly: 'weekly',
  monthly: 'monthly',
} as const

export type StudentRankingPeriod = ValueOf<typeof studentRankingPeriods>

export const studentRankingLeagues = {
  bronze: 'bronze',
  silver: 'silver',
  gold: 'gold',
} as const

export type StudentRankingLeague = ValueOf<typeof studentRankingLeagues>

export const studentQuickActionStatuses = {
  available: 'available',
  completed: 'completed',
  locked: 'locked',
} as const

export type StudentQuickActionStatus = ValueOf<typeof studentQuickActionStatuses>

export const studentQuickActionKeys = {
  startWorkout: 'start_workout',
  logMeal: 'log_meal',
  logWater: 'log_water',
  startCardio: 'start_cardio',
  viewRewards: 'view_rewards',
} as const

export type StudentQuickActionKey = ValueOf<typeof studentQuickActionKeys>

export const studentRepositorySources = {
  mock: 'mock',
  firebase: 'firebase',
} as const

export type StudentRepositorySource = ValueOf<typeof studentRepositorySources>

export type StudentProfileSupportMember = {
  id: string
  role: 'PERSONAL' | 'NUTRITIONIST'
  name: string
}

export type StudentProfile = {
  id: string
  firstName: string
  fullName: string
  avatarUrl?: string
  city: string
  neighborhood: string
  gym: string
  memberSince: string
  primaryGoal: string
  headline: string
  supportTeam: StudentProfileSupportMember[]
}

export type DailyProgress = {
  date: string
  status: DailyProgressStatus
  completionPct: number
  completedBlocks: number
  totalBlocks: number
  starsEarned: number
  xpEarned: number
  streakDays: number
  streakStatus: StreakStatus
  focusLabel: string
}

export type WorkoutExercise = {
  id: string
  name: string
  group: string
  sets: number
  reps: number
  restSec: number
  suggestedLoadKg: number
  status: WorkoutExerciseStatus
}

export type WorkoutDay = {
  id: string
  date: string
  title: string
  focus: string
  status: WorkoutDayStatus
  estimatedDurationMin: number
  completionPct: number
  rewardStars: number
  coachNote?: string
  exercises: WorkoutExercise[]
}

export type CardioSession = {
  id: string
  date: string
  title: string
  type: 'run' | 'bike' | 'walk' | 'functional'
  status: CardioSessionStatus
  intensity: 'low' | 'moderate' | 'high'
  goalDurationMin: number
  completedDurationMin: number
  targetDistanceKm?: number
  completedDistanceKm?: number
}

export type NutritionMeal = {
  id: string
  name: string
  scheduledAt: string
  status: NutritionMealStatus
  itemsSummary: string
  targetCalories: number
  consumedCalories: number
  rewardStars: number
}

export type NutritionDayPlan = {
  date: string
  status: NutritionDayPlanStatus
  adherencePct: number
  caloriesTarget: number
  caloriesConsumed: number
  proteinTargetG: number
  proteinConsumedG: number
  carbsTargetG: number
  carbsConsumedG: number
  fatTargetG: number
  fatConsumedG: number
  meals: NutritionMeal[]
}

export type WaterProgress = {
  status: WaterProgressStatus
  consumedMl: number
  targetMl: number
  remainingMl: number
  completionPct: number
  checkpointsCompleted: number
  checkpointsTotal: number
}

export type GamificationProfile = {
  level: number
  totalXp: number
  currentLevelXp: number
  nextLevelXp: number
  weeklyXp: number
  weeklyXpTarget: number
  stars: number
  streakDays: number
  streakStatus: StreakStatus
}

export type Achievement = {
  id: string
  title: string
  description: string
  category: AchievementCategory
  status: AchievementStatus
  icon: 'trophy' | 'star' | 'flame' | 'target'
  currentProgress: number
  targetProgress: number
  rewardStars: number
  rewardXp: number
  unlockedAt?: string
}

export type RankingSummary = {
  scope: StudentRankingScope
  period: StudentRankingPeriod
  league: StudentRankingLeague
  position: number
  totalParticipants: number
  points: number
  gapToNext: number
  gapToLeader: number
  trend: RankingTrend
  lastUpdatedAt: string
}

export type StudentMetrics = {
  workoutsCompletedMonth: number
  nutritionAdherencePct: number
  cardioMinutesMonth: number
  averageWaterMl: number
  currentWeightKg: number
  consistencyScore: number
}

export type StudentGoal = {
  id: string
  title: string
  type: StudentGoalType
  status: StudentGoalStatus
  current: number
  target: number
  unit: string
  deadlineLabel: string
}

export type StudentHabit = {
  id: string
  title: string
  icon: 'dumbbell' | 'utensils' | 'flask' | 'heart' | 'target' | 'flame'
  status: HabitStatus
  current: number
  target: number
  unit: string
  streakDays: number
}

export type StudentQuickAction = {
  id: string
  key: StudentQuickActionKey
  label: string
  description: string
  icon: 'play' | 'check' | 'plus' | 'mapPin' | 'trophy'
  status: StudentQuickActionStatus
  targetRoute: string
}

export type StudentDashboard = {
  profile: StudentProfile
  dailyProgress: DailyProgress
  todayWorkout: WorkoutDay | null
  cardioSession: CardioSession | null
  nutritionPlan: NutritionDayPlan
  waterProgress: WaterProgress
  gamificationProfile: GamificationProfile
  achievements: Achievement[]
  rankingSummary: RankingSummary
  metrics: StudentMetrics
  goals: StudentGoal[]
  habits: StudentHabit[]
  quickActions: StudentQuickAction[]
}

export type StudentWorkoutExecutionRecord = {
  exerciseId: string
  exerciseName: string
  loadVolumeKg: number
}

export type StudentWorkoutExecutionInput = {
  date: string
  workoutId: string
  title: string
  durationSec: number
  completedExercises: number
  totalExercises: number
  completedSets: number
  totalSets: number
  loadVolumeKg: number
  exerciseRecords: StudentWorkoutExecutionRecord[]
}

export type StudentMealStatusInput = {
  date: string
  mealId: string
  status: NutritionMealStatus
}

export type StudentWaterIntakeInput = {
  date: string
  amountMl: number
}

export type StudentProfilePreferences = ProfilePreferences

export type StudentProfilePreferencesPatch = Partial<StudentProfilePreferences>
