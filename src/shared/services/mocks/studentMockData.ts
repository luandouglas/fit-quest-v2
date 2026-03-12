import {
  achievementCategories,
  achievementStatuses,
  habitStatuses,
  nutritionMealStatuses,
  studentGoalStatuses,
  studentGoalTypes,
  studentQuickActionKeys,
  studentQuickActionStatuses,
  waterProgressStatuses,
  workoutDayStatuses,
  type Achievement,
  type CardioSession,
  type DailyProgress,
  type GamificationProfile,
  type NutritionDayPlan,
  type RankingSummary,
  type StudentDashboard,
  type StudentGoal,
  type StudentHabit,
  type StudentMetrics,
  type StudentProfile,
  type WaterProgress,
  type WorkoutDay,
} from '@/shared/services/contracts/student'

type StudentDashboardMockInput = {
  profile: StudentProfile
  dailyProgress: DailyProgress
  todayWorkout: WorkoutDay | null
  cardioSession: CardioSession | null
  nutritionPlan: NutritionDayPlan
  waterProgress: WaterProgress
  gamificationProfile: GamificationProfile
  rankingSummary: RankingSummary
  metrics: StudentMetrics
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function getGoalStatus(current: number, target: number) {
  const progress = current / Math.max(target, 1)

  if (progress >= 1) {
    return studentGoalStatuses.completed
  }

  if (progress >= 0.75) {
    return studentGoalStatuses.onTrack
  }

  return studentGoalStatuses.atRisk
}

function getHabitStatus(current: number, target: number) {
  if (current >= target) {
    return habitStatuses.completed
  }

  if (current > 0) {
    return habitStatuses.inProgress
  }

  return habitStatuses.pending
}

function createGoals(metrics: StudentMetrics, waterProgress: WaterProgress, nutritionPlan: NutritionDayPlan): StudentGoal[] {
  const workoutTarget = 18
  const cardioTarget = 180

  return [
    {
      id: 'goal-workout-frequency',
      title: 'Treinos concluídos no mês',
      type: studentGoalTypes.workout,
      status: getGoalStatus(metrics.workoutsCompletedMonth, workoutTarget),
      current: metrics.workoutsCompletedMonth,
      target: workoutTarget,
      unit: 'treinos',
      deadlineLabel: 'Fecha em 21 dias',
    },
    {
      id: 'goal-hydration',
      title: 'Meta de água do dia',
      type: studentGoalTypes.hydration,
      status: getGoalStatus(waterProgress.consumedMl, waterProgress.targetMl),
      current: waterProgress.consumedMl,
      target: waterProgress.targetMl,
      unit: 'ml',
      deadlineLabel: 'Revisão hoje às 22h',
    },
    {
      id: 'goal-nutrition',
      title: 'Aderência nutricional da semana',
      type: studentGoalTypes.nutrition,
      status: getGoalStatus(nutritionPlan.adherencePct, 85),
      current: nutritionPlan.adherencePct,
      target: 85,
      unit: '%',
      deadlineLabel: 'Fecha no domingo',
    },
    {
      id: 'goal-cardio',
      title: 'Minutos de cardio no mês',
      type: studentGoalTypes.cardio,
      status: getGoalStatus(metrics.cardioMinutesMonth, cardioTarget),
      current: metrics.cardioMinutesMonth,
      target: cardioTarget,
      unit: 'min',
      deadlineLabel: 'Fecha em 21 dias',
    },
  ]
}

function createHabits(
  dailyProgress: DailyProgress,
  waterProgress: WaterProgress,
  nutritionPlan: NutritionDayPlan,
  todayWorkout: WorkoutDay | null,
  cardioSession: CardioSession | null,
): StudentHabit[] {
  const completedMeals = nutritionPlan.meals.filter((meal) => meal.status === nutritionMealStatuses.completed).length
  const movementTarget =
    Number(Boolean(todayWorkout && todayWorkout.status !== workoutDayStatuses.restDay)) +
    Number(Boolean(cardioSession))
  const movementCurrent =
    Number(Boolean(todayWorkout && todayWorkout.status === workoutDayStatuses.completed)) +
    Number(Boolean(cardioSession && cardioSession.status === 'completed'))
  const movementStatus =
    movementTarget === 0
      ? habitStatuses.completed
      : getHabitStatus(movementCurrent, movementTarget)

  return [
    {
      id: 'habit-movement',
      title: 'Mover o corpo',
      icon: 'dumbbell',
      status: movementStatus,
      current: movementCurrent,
      target: Math.max(movementTarget, 1),
      unit: 'sessões',
      streakDays: dailyProgress.streakDays,
    },
    {
      id: 'habit-meals',
      title: 'Registrar refeições',
      icon: 'utensils',
      status: getHabitStatus(completedMeals, nutritionPlan.meals.length),
      current: completedMeals,
      target: nutritionPlan.meals.length,
      unit: 'refeições',
      streakDays: dailyProgress.streakDays,
    },
    {
      id: 'habit-water',
      title: 'Bater hidratação',
      icon: 'flask',
      status: getHabitStatus(waterProgress.checkpointsCompleted, waterProgress.checkpointsTotal),
      current: waterProgress.checkpointsCompleted,
      target: waterProgress.checkpointsTotal,
      unit: 'checkpoints',
      streakDays: dailyProgress.streakDays,
    },
  ]
}

function createAchievements(
  dailyProgress: DailyProgress,
  gamificationProfile: GamificationProfile,
  metrics: StudentMetrics,
  rankingSummary: RankingSummary,
): Achievement[] {
  const streakAchievementUnlocked = dailyProgress.streakDays >= 7
  const rankingAchievementUnlocked = rankingSummary.position <= 10
  const hydrationAchievementUnlocked = metrics.averageWaterMl >= 2500
  const levelUpProgressUnlocked = gamificationProfile.weeklyXp >= gamificationProfile.weeklyXpTarget

  return [
    {
      id: 'achievement-streak-soldier',
      title: 'Soldado da consistência',
      description: 'Mantenha 7 dias seguidos de execução.',
      category: achievementCategories.consistency,
      status: streakAchievementUnlocked ? achievementStatuses.unlocked : achievementStatuses.inProgress,
      icon: 'flame',
      currentProgress: clamp(dailyProgress.streakDays, 0, 7),
      targetProgress: 7,
      rewardStars: 8,
      rewardXp: 140,
      unlockedAt: streakAchievementUnlocked ? new Date().toISOString() : undefined,
    },
    {
      id: 'achievement-hydration-master',
      title: 'Hidratação em dia',
      description: 'Mantenha média acima de 2.5L.',
      category: achievementCategories.hydration,
      status: hydrationAchievementUnlocked ? achievementStatuses.unlocked : achievementStatuses.inProgress,
      icon: 'star',
      currentProgress: Math.round(metrics.averageWaterMl / 100),
      targetProgress: 25,
      rewardStars: 6,
      rewardXp: 120,
      unlockedAt: hydrationAchievementUnlocked ? new Date().toISOString() : undefined,
    },
    {
      id: 'achievement-ranking-rush',
      title: 'Ataque ao top 10',
      description: 'Entre no top 10 do ranking semanal.',
      category: achievementCategories.ranking,
      status: rankingAchievementUnlocked ? achievementStatuses.unlocked : achievementStatuses.inProgress,
      icon: 'trophy',
      currentProgress: Math.max(0, 11 - Math.min(rankingSummary.position, 11)),
      targetProgress: 10,
      rewardStars: 12,
      rewardXp: 220,
      unlockedAt: rankingAchievementUnlocked ? new Date().toISOString() : undefined,
    },
    {
      id: 'achievement-level-up',
      title: 'Escalada FitQuest',
      description: 'Suba mais um nível nesta semana.',
      category: achievementCategories.workout,
      status: levelUpProgressUnlocked ? achievementStatuses.unlocked : achievementStatuses.inProgress,
      icon: 'target',
      currentProgress: Math.min(gamificationProfile.weeklyXp, gamificationProfile.weeklyXpTarget),
      targetProgress: gamificationProfile.weeklyXpTarget,
      rewardStars: 10,
      rewardXp: 200,
      unlockedAt: levelUpProgressUnlocked ? new Date().toISOString() : undefined,
    },
  ]
}

function createQuickActions(
  todayWorkout: WorkoutDay | null,
  cardioSession: CardioSession | null,
  nutritionPlan: NutritionDayPlan,
  waterProgress: WaterProgress,
): StudentDashboard['quickActions'] {
  const hasPendingMeal = nutritionPlan.meals.some((meal) => meal.status === nutritionMealStatuses.pending)

  return [
    {
      id: 'student-action-workout',
      key: studentQuickActionKeys.startWorkout,
      label: todayWorkout?.status === workoutDayStatuses.completed ? 'Treino concluído' : 'Iniciar treino',
      description: todayWorkout?.title ?? 'Abrir sessão do treino de hoje',
      icon: 'play',
      status:
        !todayWorkout
          ? studentQuickActionStatuses.locked
          : todayWorkout.status === workoutDayStatuses.completed
            ? studentQuickActionStatuses.completed
            : studentQuickActionStatuses.available,
      targetRoute: '/tabs/workouts/session',
    },
    {
      id: 'student-action-meal',
      key: studentQuickActionKeys.logMeal,
      label: hasPendingMeal ? 'Registrar refeição' : 'Refeições em dia',
      description: hasPendingMeal ? 'Marcar próxima refeição planejada' : 'Tudo certo no plano alimentar',
      icon: 'check',
      status: hasPendingMeal ? studentQuickActionStatuses.available : studentQuickActionStatuses.completed,
      targetRoute: '/tabs/nutrition',
    },
    {
      id: 'student-action-water',
      key: studentQuickActionKeys.logWater,
      label: waterProgress.status === waterProgressStatuses.completed ? 'Água concluída' : 'Adicionar água',
      description: `${waterProgress.consumedMl}/${waterProgress.targetMl} ml hoje`,
      icon: 'plus',
      status:
        waterProgress.status === waterProgressStatuses.completed
          ? studentQuickActionStatuses.completed
          : studentQuickActionStatuses.available,
      targetRoute: '/tabs/nutrition',
    },
    {
      id: 'student-action-cardio',
      key: studentQuickActionKeys.startCardio,
      label: cardioSession?.status === 'completed' ? 'Cardio concluído' : 'Abrir cardio',
      description: cardioSession?.title ?? 'Executar cardio do dia',
      icon: 'mapPin',
      status:
        !cardioSession
          ? studentQuickActionStatuses.locked
          : cardioSession.status === 'completed'
            ? studentQuickActionStatuses.completed
            : studentQuickActionStatuses.available,
      targetRoute: '/tabs/run',
    },
    {
      id: 'student-action-rewards',
      key: studentQuickActionKeys.viewRewards,
      label: 'Ver recompensas',
      description: 'Acompanhar estrelas, nível e conquistas',
      icon: 'trophy',
      status: studentQuickActionStatuses.available,
      targetRoute: '/tabs/gamification',
    },
  ]
}

export function createStudentDashboardMock(input: StudentDashboardMockInput): StudentDashboard {
  return {
    ...input,
    goals: createGoals(input.metrics, input.waterProgress, input.nutritionPlan),
    habits: createHabits(
      input.dailyProgress,
      input.waterProgress,
      input.nutritionPlan,
      input.todayWorkout,
      input.cardioSession,
    ),
    achievements: createAchievements(
      input.dailyProgress,
      input.gamificationProfile,
      input.metrics,
      input.rankingSummary,
    ),
    quickActions: createQuickActions(
      input.todayWorkout,
      input.cardioSession,
      input.nutritionPlan,
      input.waterProgress,
    ),
  }
}
