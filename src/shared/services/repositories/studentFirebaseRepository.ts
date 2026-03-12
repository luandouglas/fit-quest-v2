import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  type CollectionReference,
  type DocumentReference,
} from 'firebase/firestore/lite'

import { authService } from '@/shared/services/authService'
import { getFirebaseFirestore } from '@/shared/services/firebase'
import type { NutritionDay } from '@/shared/services/contracts/nutrition'
import type { ProfilePreferences } from '@/shared/services/contracts/profile'
import {
  habitStatuses,
  nutritionMealStatuses,
  studentGoalStatuses,
  studentGoalTypes,
  studentQuickActionKeys,
  workoutDayStatuses,
} from '@/shared/services/contracts/student'
import type {
  Achievement,
  CardioSession,
  DailyProgress,
  GamificationProfile,
  NutritionDayPlan,
  RankingSummary,
  StudentDashboard,
  StudentGoal,
  StudentHabit,
  StudentMetrics,
  StudentMealStatusInput,
  StudentProfile,
  StudentProfilePreferencesPatch,
  StudentWaterIntakeInput,
  StudentWorkoutExecutionInput,
  WaterProgress,
  WorkoutDay,
} from '@/shared/services/contracts/student'

import type { StudentDashboardQuery, StudentRepository } from './studentRepository'
import {
  deriveStudentActivityMetrics,
  getStreakStatus,
  toLevelProgress,
} from './studentActivityDerivations'

type FirestoreStudentPreferencesDocument = {
  preferences: ProfilePreferences
}

function getDb() {
  const db = getFirebaseFirestore()

  if (!db) {
    throw new Error('Firebase is not configured for student data.')
  }

  return db
}

function resolveStudentId() {
  const session = authService.getStoredSession()

  if (!session || session.user.role !== 'STUDENT') {
    throw new Error('Authenticated student session is required for Firebase access.')
  }

  return session.user.id
}

function studentDoc<T>(studentId: string, ...segments: string[]) {
  return doc(getDb(), 'students', studentId, ...segments) as DocumentReference<T>
}

function studentCollection<T>(studentId: string, ...segments: string[]) {
  return collection(getDb(), 'students', studentId, ...segments) as CollectionReference<T>
}

async function getRequiredDoc<T>(reference: DocumentReference<T>, label: string) {
  const snapshot = await getDoc(reference)

  if (!snapshot.exists()) {
    throw new Error(`Firebase document not found for ${label}.`)
  }

  return snapshot.data()
}

function getDailyProgressStatus(completionPct: number): DailyProgress['status'] {
  if (completionPct >= 100) {
    return 'completed'
  }

  if (completionPct > 0) {
    return 'in_progress'
  }

  return 'not_started'
}

function buildNutritionPlanStatus(day: NutritionDay): NutritionDayPlan['status'] {
  const completedMeals = day.meals.filter((meal) => meal.status === 'done').length
  const skippedMeals = day.meals.filter((meal) => meal.status === 'skipped').length

  if (day.meals.length > 0 && completedMeals === day.meals.length) {
    return 'completed'
  }

  if (day.meals.length > 0 && completedMeals + skippedMeals === day.meals.length && skippedMeals > 0) {
    return 'partial'
  }

  if (completedMeals > 0 || skippedMeals > 0 || day.consumed.waterMl > 0) {
    return 'in_progress'
  }

  return 'planned'
}

function buildNutritionPlan(day: NutritionDay): NutritionDayPlan {
  const completedMeals = day.meals.filter((meal) => meal.status === 'done').length
  const adherencePct = day.meals.length > 0 ? Math.round((completedMeals / day.meals.length) * 100) : 0

  return {
    date: day.date,
    status: buildNutritionPlanStatus(day),
    adherencePct,
    caloriesTarget: day.goals.calories,
    caloriesConsumed: day.consumed.calories,
    proteinTargetG: day.goals.protein,
    proteinConsumedG: day.consumed.protein,
    carbsTargetG: day.goals.carbs,
    carbsConsumedG: day.consumed.carbs,
    fatTargetG: day.goals.fat,
    fatConsumedG: day.consumed.fat,
    meals: day.meals.map((meal) => ({
      id: meal.id,
      name: meal.name,
      scheduledAt: meal.time,
      status: meal.status === 'done' ? 'completed' : meal.status,
      itemsSummary: meal.items.map((item) => item.label).join(', '),
      targetCalories: meal.targetMacros.calories,
      consumedCalories: meal.status === 'done' ? meal.targetMacros.calories : 0,
      rewardStars: meal.status === 'done' ? 3 : 0,
    })),
  }
}

function buildWaterProgressFromDay(day: NutritionDay): WaterProgress {
  const completionPct = Math.round((day.consumed.waterMl / Math.max(day.goals.waterMl, 1)) * 100)
  const checkpointsTotal = Math.max(Math.ceil(day.goals.waterMl / 500), 1)

  return {
    status: completionPct >= 100 ? 'completed' : completionPct > 0 ? 'in_progress' : 'empty',
    consumedMl: day.consumed.waterMl,
    targetMl: day.goals.waterMl,
    remainingMl: Math.max(day.goals.waterMl - day.consumed.waterMl, 0),
    completionPct: Math.min(Math.max(completionPct, 0), 100),
    checkpointsCompleted: Math.min(Math.floor(day.consumed.waterMl / 500), checkpointsTotal),
    checkpointsTotal,
  }
}

async function getNutritionDay(studentId: string, date: string) {
  const snapshot = await getDoc(studentDoc<NutritionDay>(studentId, 'nutritionDays', date))

  if (!snapshot.exists()) {
    throw new Error(`Firebase document not found for nutrition day (${date}).`)
  }

  return snapshot.data()
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

function buildGoals(metrics: StudentMetrics, waterProgress: WaterProgress, nutritionPlan: NutritionDayPlan): StudentGoal[] {
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

function buildHabits(
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
    movementTarget === 0 ? habitStatuses.completed : getHabitStatus(movementCurrent, movementTarget)

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

function buildQuickActions(
  todayWorkout: WorkoutDay | null,
  cardioSession: CardioSession | null,
  nutritionPlan: NutritionDayPlan,
  waterProgress: WaterProgress,
): StudentDashboard['quickActions'] {
  const hasPendingMeal = nutritionPlan.meals.some((meal) => meal.status === nutritionMealStatuses.pending)

  return [
    {
      id: 'firebase-workout',
      key: studentQuickActionKeys.startWorkout,
      label: todayWorkout?.status === workoutDayStatuses.completed ? 'Treino concluído' : 'Iniciar treino',
      description: todayWorkout?.title ?? 'Abrir próximos treinos',
      icon: 'play',
      status:
        !todayWorkout || todayWorkout.status === workoutDayStatuses.restDay
          ? 'locked'
          : todayWorkout.status === workoutDayStatuses.completed
            ? 'completed'
            : 'available',
      targetRoute: '/tabs/workouts',
    },
    {
      id: 'firebase-cardio',
      key: studentQuickActionKeys.startCardio,
      label: cardioSession?.status === 'completed' ? 'Cardio concluído' : 'Registrar cardio',
      description: cardioSession?.title ?? 'Corrida ou caminhada do dia',
      icon: 'mapPin',
      status: !cardioSession ? 'available' : cardioSession.status === 'completed' ? 'completed' : 'available',
      targetRoute: '/tabs/run',
    },
    {
      id: 'firebase-nutrition',
      key: studentQuickActionKeys.logMeal,
      label: hasPendingMeal ? 'Registrar refeição' : 'Nutrição em dia',
      description: hasPendingMeal ? 'Feche as refeições pendentes' : 'Plano do dia consolidado',
      icon: 'check',
      status: hasPendingMeal ? 'available' : 'completed',
      targetRoute: '/tabs/nutrition',
    },
    {
      id: 'firebase-water',
      key: studentQuickActionKeys.logWater,
      label: waterProgress.status === 'completed' ? 'Água concluída' : 'Adicionar água',
      description: `${waterProgress.consumedMl}/${waterProgress.targetMl} ml hoje`,
      icon: 'plus',
      status: waterProgress.status === 'completed' ? 'completed' : 'available',
      targetRoute: '/tabs/nutrition',
    },
    {
      id: 'firebase-rewards',
      key: studentQuickActionKeys.viewRewards,
      label: 'Ver recompensas',
      description: 'Nível, conquistas e ranking',
      icon: 'trophy',
      status: 'available',
      targetRoute: '/tabs/gamification',
    },
  ]
}

function buildDailyProgress(input: {
  date: string
  todayWorkout: WorkoutDay | null
  cardioSession: CardioSession | null
  nutritionPlan: NutritionDayPlan
  waterProgress: WaterProgress
  streakDays: number
  todayXp: number
  todayStars: number
}): DailyProgress {
  const progressSlices = [
    input.todayWorkout ? input.todayWorkout.completionPct : null,
    input.nutritionPlan.adherencePct,
    input.waterProgress.completionPct,
    input.cardioSession ? (input.cardioSession.status === 'completed' ? 100 : 0) : null,
  ].filter((value): value is number => value !== null)
  const completionPct = progressSlices.length
    ? Math.round(progressSlices.reduce((total, value) => total + value, 0) / progressSlices.length)
    : 0
  const completedBlocks = progressSlices.filter((value) => value >= 100).length
  const workoutStatus = input.todayWorkout?.status
  const hasPendingMeals = input.nutritionPlan.meals.some((meal) => meal.status === nutritionMealStatuses.pending)
  const hasPendingWater = input.waterProgress.status !== 'completed'
  const hasPendingWorkout =
    workoutStatus !== undefined &&
    workoutStatus !== workoutDayStatuses.completed &&
    workoutStatus !== workoutDayStatuses.restDay

  return {
    date: input.date,
    status: getDailyProgressStatus(completionPct),
    completionPct,
    completedBlocks,
    totalBlocks: progressSlices.length,
    starsEarned: input.todayStars,
    xpEarned: input.todayXp,
    streakDays: input.streakDays,
    streakStatus: getStreakStatus(input.streakDays),
    focusLabel:
      hasPendingWorkout && input.todayWorkout
        ? input.todayWorkout.title
        : hasPendingMeals
          ? 'Registrar refeições pendentes'
          : hasPendingWater
            ? 'Fechar hidratação do dia'
            : 'Dia consolidado, avance para a próxima meta',
  }
}

export const studentFirebaseRepository: StudentRepository = {
  source: 'firebase',
  async getDashboard({ date }: StudentDashboardQuery): Promise<StudentDashboard> {
    const studentId = resolveStudentId()
    const [profile, todayWorkout, cardioSession, nutritionDay, storedGamificationProfile, rankingSummary, metrics, achievementsSnapshot, workoutHistorySnapshot, cardioHistorySnapshot, nutritionDaysSnapshot] =
      await Promise.all([
        this.getProfile(),
        this.getWorkoutDay(date),
        this.getCardioSession(date),
        getNutritionDay(studentId, date),
        this.getGamificationProfile(),
        this.getRankingSummary(),
        this.getMetrics(),
        getDocs(studentCollection<Achievement>(studentId, 'achievements')),
        getDocs(studentCollection<{ completedAt: string; rewardStars: number; completionPct?: number }>(studentId, 'workoutSessionsHistory')),
        getDocs(studentCollection<{ startedAt: string; endedAt?: string; distanceKm: number; starsEarned: number }>(studentId, 'cardioHistory')),
        getDocs(studentCollection<NutritionDay>(studentId, 'nutritionDays')),
      ])

    const nutritionPlan = buildNutritionPlan(nutritionDay)
    const achievements = achievementsSnapshot.docs.map((entry) => entry.data())
    const waterProgress = buildWaterProgressFromDay(nutritionDay)
    const workoutHistory = workoutHistorySnapshot.docs.map((entry) => entry.data())
    const cardioHistory = cardioHistorySnapshot.docs.map((entry) => entry.data())
    const nutritionDays = nutritionDaysSnapshot.docs.map((entry) => entry.data())
    const derivedGamification = deriveStudentActivityMetrics({
      anchorDate: date,
      workoutHistory,
      cardioHistory,
      nutritionDays,
      weeklyXpTarget: storedGamificationProfile.weeklyXpTarget,
    })
    const gamificationProfile: GamificationProfile = {
      ...storedGamificationProfile,
      ...toLevelProgress(derivedGamification.totalXp),
      totalXp: derivedGamification.totalXp,
      weeklyXp: derivedGamification.weeklyXp,
      weeklyXpTarget: derivedGamification.weeklyXpTarget,
      stars: derivedGamification.totalStars,
      streakDays: derivedGamification.streakDays,
      streakStatus: getStreakStatus(derivedGamification.streakDays),
    }
    const derivedMetrics: StudentMetrics = {
      ...metrics,
      workoutsCompletedMonth: derivedGamification.monthlyWorkoutCount,
      nutritionAdherencePct: derivedGamification.nutritionAdherencePct,
      cardioMinutesMonth: derivedGamification.monthlyCardioMinutes,
      averageWaterMl: derivedGamification.averageWaterMl,
    }
    const dailyProgress = buildDailyProgress({
      date,
      todayWorkout,
      cardioSession,
      nutritionPlan,
      waterProgress,
      streakDays: derivedGamification.streakDays,
      todayXp: derivedGamification.todayXp,
      todayStars: derivedGamification.todayStars,
    })
    const goals = buildGoals(derivedMetrics, waterProgress, nutritionPlan)
    const habits = buildHabits(dailyProgress, waterProgress, nutritionPlan, todayWorkout, cardioSession)

    return {
      profile,
      dailyProgress,
      todayWorkout,
      cardioSession,
      nutritionPlan,
      waterProgress,
      gamificationProfile,
      achievements,
      rankingSummary,
      metrics: derivedMetrics,
      goals,
      habits,
      quickActions: buildQuickActions(todayWorkout, cardioSession, nutritionPlan, waterProgress),
    }
  },
  async getProfile(): Promise<StudentProfile> {
    const studentId = resolveStudentId()
    return getRequiredDoc(studentDoc<StudentProfile>(studentId, 'profile', 'core'), 'student profile')
  },
  async getDailyProgress(date: string): Promise<DailyProgress> {
    const dashboard = await this.getDashboard({ date })
    return dashboard.dailyProgress
  },
  async getWorkoutDay(date: string): Promise<WorkoutDay | null> {
    const studentId = resolveStudentId()
    const snapshot = await getDoc(studentDoc<WorkoutDay>(studentId, 'workoutDays', date))
    return snapshot.exists() ? snapshot.data() : null
  },
  async getCardioSession(date: string): Promise<CardioSession | null> {
    const studentId = resolveStudentId()
    const snapshot = await getDoc(studentDoc<CardioSession>(studentId, 'cardioSessions', date))
    return snapshot.exists() ? snapshot.data() : null
  },
  async saveWorkoutExecution(input: StudentWorkoutExecutionInput): Promise<void> {
    const studentId = resolveStudentId()
    await setDoc(
      studentDoc(studentId, 'workoutExecutions', `${input.date}_${input.workoutId}`),
      {
        ...input,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    )
    await setDoc(
      studentDoc(studentId, 'workoutDays', input.date),
      {
        id: input.workoutId,
        date: input.date,
        title: input.title,
        focus: 'Sessão concluída',
        status: 'completed',
        estimatedDurationMin: Math.max(Math.round(input.durationSec / 60), 1),
        completionPct: 100,
        rewardStars: Math.max(Math.round(input.completedExercises), 1),
        exercises: [],
      } satisfies WorkoutDay,
      { merge: true },
    )
  },
  async getNutritionDayPlan(date: string): Promise<NutritionDayPlan> {
    const studentId = resolveStudentId()
    const day = await getNutritionDay(studentId, date)
    return buildNutritionPlan(day)
  },
  async saveMealStatus(input: StudentMealStatusInput): Promise<NutritionDayPlan> {
    const studentId = resolveStudentId()
    const reference = studentDoc<NutritionDay>(studentId, 'nutritionDays', input.date)
    const current = await getNutritionDay(studentId, input.date)
    const nextDay: NutritionDay = {
      ...current,
      meals: current.meals.map((meal) =>
        meal.id === input.mealId
        ? {
            ...meal,
            status: input.status === 'completed' ? 'done' : input.status,
            completedAt: input.status === 'completed' ? new Date().toISOString() : undefined,
          }
        : meal,
      ),
    }
    const recalculatedDay: NutritionDay = {
      ...nextDay,
      consumed: {
        calories: nextDay.meals.filter((meal) => meal.status === 'done').reduce((total, meal) => total + meal.targetMacros.calories, 0),
        protein: nextDay.meals.filter((meal) => meal.status === 'done').reduce((total, meal) => total + meal.targetMacros.protein, 0),
        carbs: nextDay.meals.filter((meal) => meal.status === 'done').reduce((total, meal) => total + meal.targetMacros.carbs, 0),
        fat: nextDay.meals.filter((meal) => meal.status === 'done').reduce((total, meal) => total + meal.targetMacros.fat, 0),
        waterMl: current.consumed.waterMl,
      },
    }

    await setDoc(reference, recalculatedDay, { merge: true })
    return buildNutritionPlan(recalculatedDay)
  },
  async saveWaterIntake(input: StudentWaterIntakeInput) {
    const studentId = resolveStudentId()
    const reference = studentDoc<NutritionDay>(studentId, 'nutritionDays', input.date)
    const current = await getNutritionDay(studentId, input.date)
    const nextDay: NutritionDay = {
      ...current,
      waterLog: {
        entries: [
          ...current.waterLog.entries,
          {
            id: `${input.date}-water-${crypto.randomUUID()}`,
            ml: Math.max(input.amountMl, 0),
            at: new Date().toISOString(),
          },
        ],
      },
      consumed: {
        ...current.consumed,
        waterMl: current.waterLog.entries.reduce((total, entry) => total + entry.ml, 0) + Math.max(input.amountMl, 0),
      },
    }
    await setDoc(reference, nextDay, { merge: true })
    const nutritionPlan = buildNutritionPlan(nextDay)
    const waterProgress = buildWaterProgressFromDay(nextDay)

    return {
      nutritionPlan,
      waterProgress,
    }
  },
  async getGamificationProfile(): Promise<GamificationProfile> {
    const studentId = resolveStudentId()
    return getRequiredDoc(studentDoc<GamificationProfile>(studentId, 'gamification', 'summary'), 'gamification summary')
  },
  async getMetrics(): Promise<StudentDashboard['metrics']> {
    const studentId = resolveStudentId()
    return getRequiredDoc(studentDoc<StudentDashboard['metrics']>(studentId, 'metrics', 'summary'), 'student metrics')
  },
  async getRankingSummary(): Promise<RankingSummary> {
    const studentId = resolveStudentId()
    return getRequiredDoc(studentDoc<RankingSummary>(studentId, 'ranking', 'summary'), 'ranking summary')
  },
  async getProfilePreferences(): Promise<ProfilePreferences> {
    const studentId = resolveStudentId()
    const document = await getRequiredDoc(
      studentDoc<FirestoreStudentPreferencesDocument>(studentId, 'preferences', 'profile'),
      'profile preferences',
    )
    return document.preferences
  },
  async saveProfilePreferences(patch: StudentProfilePreferencesPatch): Promise<ProfilePreferences> {
    const studentId = resolveStudentId()
    const reference = studentDoc<FirestoreStudentPreferencesDocument>(studentId, 'preferences', 'profile')
    const snapshot = await getDoc(reference)
    const current = snapshot.exists()
      ? snapshot.data().preferences
      : ({
          notificationsEnabled: true,
          remindersEnabled: true,
          measurementSystem: 'metric',
          themePreference: 'system',
        } satisfies ProfilePreferences)
    const preferences = {
      ...current,
      ...patch,
    } satisfies ProfilePreferences

    await setDoc(reference, { preferences }, { merge: true })
    return preferences
  },
}
