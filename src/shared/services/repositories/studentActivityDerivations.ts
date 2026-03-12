import type {
  GamificationHeatmapPoint,
  GamificationMission,
  GamificationXpBreakdown,
} from '@/shared/services/contracts/gamification'
import type { NutritionDay } from '@/shared/services/contracts/nutrition'

export type StudentWorkoutHistoryEntry = {
  completedAt: string
  rewardStars?: number
  completionPct?: number
  durationSec?: number
}

export type StudentCardioHistoryEntry = {
  startedAt: string
  endedAt?: string
  distanceKm?: number
  elapsedSec?: number
  starsEarned?: number
}

type DailyCompletionFlags = {
  movement: boolean
  water: boolean
  meals: boolean
}

const DAILY_MISSION_REWARDS = {
  movement: 30,
  meals: 30,
  water: 20,
} as const

const WEEKLY_MISSION_REWARDS = {
  trainingMinutes: 120,
  hydrationConsistency: 80,
  nutritionAdherence: 100,
} as const

export function toIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function addDays(date: string, offset: number) {
  const nextDate = new Date(`${date}T12:00:00`)
  nextDate.setDate(nextDate.getDate() + offset)
  return toIsoDate(nextDate)
}

function startOfWeek(date: Date) {
  const nextDate = new Date(date)
  const day = nextDate.getDay()
  const diff = (day + 6) % 7
  nextDate.setDate(nextDate.getDate() - diff)
  nextDate.setHours(0, 0, 0, 0)
  return nextDate
}

function weekKey(date: Date) {
  return toIsoDate(startOfWeek(date))
}

function getWorkoutDurationMin(entry: StudentWorkoutHistoryEntry) {
  return Math.max(Math.round((entry.durationSec ?? 0) / 60), 0)
}

function getCardioDurationMin(entry: StudentCardioHistoryEntry) {
  return Math.max(Math.round((entry.elapsedSec ?? 0) / 60), 0)
}

function getCompletionFlags(day?: NutritionDay): DailyCompletionFlags {
  if (!day) {
    return {
      movement: false,
      water: false,
      meals: false,
    }
  }

  return {
    movement: false,
    water: day.consumed.waterMl >= day.goals.waterMl,
    meals: day.meals.length > 0 && day.meals.every((meal) => meal.status === 'done'),
  }
}

function countCompletedMeals(day?: NutritionDay) {
  if (!day) {
    return 0
  }

  return day.meals.filter((meal) => meal.status === 'done').length
}

function buildWeeklyFlags(dayCompletionFlags: Map<string, DailyCompletionFlags>) {
  const flagsByWeek = new Map<
    string,
    {
      hydrationDays: number
      nutritionDays: number
    }
  >()

  dayCompletionFlags.forEach((flags, dateKey) => {
    const key = weekKey(new Date(`${dateKey}T12:00:00`))
    const current = flagsByWeek.get(key) ?? { hydrationDays: 0, nutritionDays: 0 }

    flagsByWeek.set(key, {
      hydrationDays: current.hydrationDays + (flags.water ? 1 : 0),
      nutritionDays: current.nutritionDays + (flags.meals ? 1 : 0),
    })
  })

  return flagsByWeek
}

export function calculateWorkoutXp(rewardStars: number, completionPct: number) {
  return 120 + Math.round(Math.max(completionPct, 0) / 10) * 10 + Math.max(rewardStars, 0)
}

export function calculateCardioXp(distanceKm = 0) {
  return 80 + Math.round(Math.max(distanceKm, 0) * 40)
}

export function toLevelProgress(totalXp: number) {
  let level = 1
  let consumedXp = 0
  let levelTarget = 400

  while (totalXp >= consumedXp + levelTarget) {
    consumedXp += levelTarget
    level += 1
    levelTarget = 400 + (level - 1) * 120
  }

  return {
    level,
    currentLevelXp: totalXp - consumedXp,
    nextLevelXp: levelTarget,
  }
}

export function getStreakStatus(days: number) {
  if (days <= 0) {
    return 'broken' as const
  }

  if (days >= 10) {
    return 'hot' as const
  }

  if (days >= 4) {
    return 'building' as const
  }

  return 'cold' as const
}

export function calculateConsecutiveStreak(input: {
  anchorDate: string
  workoutHistory: StudentWorkoutHistoryEntry[]
  cardioHistory: StudentCardioHistoryEntry[]
  nutritionDays: NutritionDay[]
}) {
  const workoutDates = new Set(input.workoutHistory.map((entry) => toIsoDate(new Date(entry.completedAt))))
  const cardioDates = new Set(
    input.cardioHistory.map((entry) => toIsoDate(new Date(entry.endedAt ?? entry.startedAt))),
  )
  const hydrationDates = new Set(
    input.nutritionDays
      .filter((day) => day.consumed.waterMl >= day.goals.waterMl)
      .map((day) => day.date),
  )

  let streak = 0

  for (let offset = 0; offset < 30; offset += 1) {
    const key = addDays(input.anchorDate, -offset)

    if (workoutDates.has(key) || cardioDates.has(key) || hydrationDates.has(key)) {
      streak += 1
      continue
    }

    break
  }

  return streak
}

export function deriveStudentActivityMetrics(input: {
  anchorDate: string
  workoutHistory: StudentWorkoutHistoryEntry[]
  cardioHistory: StudentCardioHistoryEntry[]
  nutritionDays: NutritionDay[]
  weeklyXpTarget?: number
}) {
  const dayCompletionFlags = new Map<string, DailyCompletionFlags>()
  const sessionsByWeek = new Map<string, number>()
  const trainingMinutesByWeek = new Map<string, number>()
  const activityByDay = new Map<string, number>()

  input.workoutHistory.forEach((entry) => {
    const completedAt = new Date(entry.completedAt)
    const dateKey = toIsoDate(completedAt)
    const currentFlags = dayCompletionFlags.get(dateKey) ?? getCompletionFlags()

    dayCompletionFlags.set(dateKey, {
      ...currentFlags,
      movement: true,
    })
    activityByDay.set(dateKey, (activityByDay.get(dateKey) ?? 0) + 1)

    const key = weekKey(completedAt)
    sessionsByWeek.set(key, (sessionsByWeek.get(key) ?? 0) + 1)
    trainingMinutesByWeek.set(key, (trainingMinutesByWeek.get(key) ?? 0) + getWorkoutDurationMin(entry))
  })

  input.cardioHistory.forEach((entry) => {
    const completedAt = new Date(entry.endedAt ?? entry.startedAt)
    const dateKey = toIsoDate(completedAt)
    const currentFlags = dayCompletionFlags.get(dateKey) ?? getCompletionFlags()

    dayCompletionFlags.set(dateKey, {
      ...currentFlags,
      movement: true,
    })
    activityByDay.set(dateKey, (activityByDay.get(dateKey) ?? 0) + 1)

    const key = weekKey(completedAt)
    sessionsByWeek.set(key, (sessionsByWeek.get(key) ?? 0) + 1)
    trainingMinutesByWeek.set(key, (trainingMinutesByWeek.get(key) ?? 0) + getCardioDurationMin(entry))
  })

  input.nutritionDays.forEach((day) => {
    const currentFlags = dayCompletionFlags.get(day.date) ?? getCompletionFlags()
    const nextFlags = {
      movement: currentFlags.movement,
      water: day.consumed.waterMl >= day.goals.waterMl,
      meals: day.meals.length > 0 && day.meals.every((meal) => meal.status === 'done'),
    }

    dayCompletionFlags.set(day.date, nextFlags)

    const completedMeals = countCompletedMeals(day)

    if (completedMeals > 0) {
      activityByDay.set(day.date, (activityByDay.get(day.date) ?? 0) + 1)
    }

    if (nextFlags.water) {
      activityByDay.set(day.date, (activityByDay.get(day.date) ?? 0) + 1)
    }

    if (nextFlags.meals && nextFlags.water) {
      const key = weekKey(new Date(`${day.date}T12:00:00`))
      sessionsByWeek.set(key, (sessionsByWeek.get(key) ?? 0) + 1)
    }
  })

  const weeklyFlags = buildWeeklyFlags(dayCompletionFlags)
  const workoutXpTotal = input.workoutHistory.reduce(
    (total, entry) => total + calculateWorkoutXp(entry.rewardStars ?? 0, entry.completionPct ?? 100),
    0,
  )
  const cardioXpTotal = input.cardioHistory.reduce(
    (total, entry) => total + calculateCardioXp(entry.distanceKm ?? 0),
    0,
  )
  const nutritionXpTotal = input.nutritionDays.reduce((total, day) => total + countCompletedMeals(day) * 20, 0)
  const hydrationXpTotal = input.nutritionDays.reduce(
    (total, day) => total + (day.consumed.waterMl >= day.goals.waterMl ? 40 : 0),
    0,
  )
  const dailyMissionXpTotal = Array.from(dayCompletionFlags.values()).reduce((total, flags) => {
    return (
      total +
      (flags.movement ? DAILY_MISSION_REWARDS.movement : 0) +
      (flags.meals ? DAILY_MISSION_REWARDS.meals : 0) +
      (flags.water ? DAILY_MISSION_REWARDS.water : 0)
    )
  }, 0)
  const weeklyMissionXpTotal = Array.from(weeklyFlags.entries()).reduce((total, [key, flags]) => {
    const trainingMinutes = trainingMinutesByWeek.get(key) ?? 0

    return (
      total +
      (trainingMinutes >= 180 ? WEEKLY_MISSION_REWARDS.trainingMinutes : 0) +
      (flags.hydrationDays >= 5 ? WEEKLY_MISSION_REWARDS.hydrationConsistency : 0) +
      (flags.nutritionDays >= 4 ? WEEKLY_MISSION_REWARDS.nutritionAdherence : 0)
    )
  }, 0)
  const totalXp = workoutXpTotal + cardioXpTotal + nutritionXpTotal + hydrationXpTotal + dailyMissionXpTotal + weeklyMissionXpTotal

  const currentWeekStart = startOfWeek(new Date(`${input.anchorDate}T12:00:00`))
  const currentWeekStartKey = toIsoDate(currentWeekStart)
  const currentWeekEnd = new Date(currentWeekStart)
  currentWeekEnd.setDate(currentWeekEnd.getDate() + 6)
  currentWeekEnd.setHours(23, 59, 59, 999)

  const weeklyWorkoutXp = input.workoutHistory.reduce((total, entry) => {
    const completedAt = new Date(entry.completedAt)

    if (completedAt < currentWeekStart || completedAt > currentWeekEnd) {
      return total
    }

    return total + calculateWorkoutXp(entry.rewardStars ?? 0, entry.completionPct ?? 100)
  }, 0)
  const weeklyCardioXp = input.cardioHistory.reduce((total, entry) => {
    const completedAt = new Date(entry.endedAt ?? entry.startedAt)

    if (completedAt < currentWeekStart || completedAt > currentWeekEnd) {
      return total
    }

    return total + calculateCardioXp(entry.distanceKm ?? 0)
  }, 0)
  const weeklyNutritionXp = input.nutritionDays.reduce((total, day) => {
    if (day.date < currentWeekStartKey || day.date > toIsoDate(currentWeekEnd)) {
      return total
    }

    return total + countCompletedMeals(day) * 20 + (day.consumed.waterMl >= day.goals.waterMl ? 40 : 0)
  }, 0)
  const currentWeekFlags = weeklyFlags.get(weekKey(currentWeekStart)) ?? { hydrationDays: 0, nutritionDays: 0 }
  const currentWeekTrainingMinutes = trainingMinutesByWeek.get(weekKey(currentWeekStart)) ?? 0
  const weeklyMissionXp =
    (currentWeekTrainingMinutes >= 180 ? WEEKLY_MISSION_REWARDS.trainingMinutes : 0) +
    (currentWeekFlags.hydrationDays >= 5 ? WEEKLY_MISSION_REWARDS.hydrationConsistency : 0) +
    (currentWeekFlags.nutritionDays >= 4 ? WEEKLY_MISSION_REWARDS.nutritionAdherence : 0)
  const weeklyXp = weeklyWorkoutXp + weeklyCardioXp + weeklyNutritionXp + weeklyMissionXp

  const todayNutritionDay = input.nutritionDays.find((day) => day.date === input.anchorDate)
  const todayFlags = dayCompletionFlags.get(input.anchorDate) ?? getCompletionFlags(todayNutritionDay)
  const todayWorkoutXp = input.workoutHistory
    .filter((entry) => toIsoDate(new Date(entry.completedAt)) === input.anchorDate)
    .reduce((total, entry) => total + calculateWorkoutXp(entry.rewardStars ?? 0, entry.completionPct ?? 100), 0)
  const todayCardioXp = input.cardioHistory
    .filter((entry) => toIsoDate(new Date(entry.endedAt ?? entry.startedAt)) === input.anchorDate)
    .reduce((total, entry) => total + calculateCardioXp(entry.distanceKm ?? 0), 0)
  const todayNutritionXp = countCompletedMeals(todayNutritionDay) * 20
  const todayHydrationXp =
    todayNutritionDay && todayNutritionDay.consumed.waterMl >= todayNutritionDay.goals.waterMl ? 40 : 0
  const todayMissionXp =
    (todayFlags.movement ? DAILY_MISSION_REWARDS.movement : 0) +
    (todayFlags.meals ? DAILY_MISSION_REWARDS.meals : 0) +
    (todayFlags.water ? DAILY_MISSION_REWARDS.water : 0)
  const todayXp = todayWorkoutXp + todayCardioXp + todayNutritionXp + todayHydrationXp + todayMissionXp
  const totalStars =
    input.workoutHistory.reduce((total, entry) => total + Math.max(entry.rewardStars ?? 0, 0), 0) +
    input.cardioHistory.reduce((total, entry) => total + Math.max(entry.starsEarned ?? 0, 0), 0) +
    input.nutritionDays.reduce((total, day) => total + countCompletedMeals(day) * 3, 0) +
    input.nutritionDays.reduce((total, day) => total + (day.consumed.waterMl >= day.goals.waterMl ? 4 : 0), 0)
  const todayStars =
    input.workoutHistory
      .filter((entry) => toIsoDate(new Date(entry.completedAt)) === input.anchorDate)
      .reduce((total, entry) => total + Math.max(entry.rewardStars ?? 0, 0), 0) +
    input.cardioHistory
      .filter((entry) => toIsoDate(new Date(entry.endedAt ?? entry.startedAt)) === input.anchorDate)
      .reduce((total, entry) => total + Math.max(entry.starsEarned ?? 0, 0), 0) +
    countCompletedMeals(todayNutritionDay) * 3 +
    (todayNutritionDay && todayNutritionDay.consumed.waterMl >= todayNutritionDay.goals.waterMl ? 4 : 0)

  const streakDays = calculateConsecutiveStreak({
    anchorDate: input.anchorDate,
    workoutHistory: input.workoutHistory,
    cardioHistory: input.cardioHistory,
    nutritionDays: input.nutritionDays,
  })

  let weeklyStreak = 0
  for (let offset = 0; offset < 12; offset += 1) {
    const referenceDate = new Date(currentWeekStart)
    referenceDate.setDate(referenceDate.getDate() - offset * 7)
    const key = weekKey(referenceDate)

    if ((sessionsByWeek.get(key) ?? 0) >= 2) {
      weeklyStreak += 1
      continue
    }

    break
  }

  const activityHeatmap: GamificationHeatmapPoint[] = Array.from({ length: 14 }, (_, index) => {
    const dateKey = addDays(input.anchorDate, -13 + index)

    return {
      date: dateKey,
      value: activityByDay.get(dateKey) ?? 0,
    }
  })

  const dailyMissions: GamificationMission[] = [
    {
      id: 'mission-train',
      title: 'Movimento do dia',
      description: 'Conclua 1 treino ou corrida hoje.',
      cadence: 'daily',
      current: input.workoutHistory.filter((entry) => toIsoDate(new Date(entry.completedAt)) === input.anchorDate).length +
        input.cardioHistory.filter((entry) => toIsoDate(new Date(entry.endedAt ?? entry.startedAt)) === input.anchorDate).length,
      target: 1,
      rewardXp: DAILY_MISSION_REWARDS.movement,
      completed: todayFlags.movement,
    },
    {
      id: 'mission-meals',
      title: 'Refeicoes completas',
      description: 'Finalize todas as refeicoes planejadas do dia.',
      cadence: 'daily',
      current: countCompletedMeals(todayNutritionDay),
      target: Math.max(todayNutritionDay?.meals.length ?? 0, 1),
      rewardXp: DAILY_MISSION_REWARDS.meals,
      completed: todayFlags.meals,
    },
    {
      id: 'mission-water',
      title: 'Meta de hidratacao',
      description: 'Atinja a meta diaria de agua.',
      cadence: 'daily',
      current: todayNutritionDay?.consumed.waterMl ?? 0,
      target: todayNutritionDay?.goals.waterMl ?? 2500,
      rewardXp: DAILY_MISSION_REWARDS.water,
      completed: todayFlags.water,
    },
  ]

  const weeklyMissions: GamificationMission[] = [
    {
      id: 'mission-weekly-training-minutes',
      title: 'Volume de treino semanal',
      description: 'Acumule 180 min entre treino e corrida.',
      cadence: 'weekly',
      current: currentWeekTrainingMinutes,
      target: 180,
      rewardXp: WEEKLY_MISSION_REWARDS.trainingMinutes,
      completed: currentWeekTrainingMinutes >= 180,
      rewardBadgeId: 'consistency',
    },
    {
      id: 'mission-weekly-hydration',
      title: 'Hidratacao consistente',
      description: 'Bata a meta de agua em 5 dias da semana.',
      cadence: 'weekly',
      current: currentWeekFlags.hydrationDays,
      target: 5,
      rewardXp: WEEKLY_MISSION_REWARDS.hydrationConsistency,
      completed: currentWeekFlags.hydrationDays >= 5,
      rewardBadgeId: 'hydration-master',
    },
    {
      id: 'mission-weekly-nutrition',
      title: 'Aderencia alimentar',
      description: 'Conclua todas as refeicoes em 4 dias da semana.',
      cadence: 'weekly',
      current: currentWeekFlags.nutritionDays,
      target: 4,
      rewardXp: WEEKLY_MISSION_REWARDS.nutritionAdherence,
      completed: currentWeekFlags.nutritionDays >= 4,
      rewardBadgeId: 'nutrition-focus',
    },
  ]

  const weeklyXpTarget = input.weeklyXpTarget ?? 1000
  const xpBreakdown: GamificationXpBreakdown = {
    workout: workoutXpTotal,
    nutrition: nutritionXpTotal,
    hydration: hydrationXpTotal,
    run: cardioXpTotal,
    professional: 0,
    mission: dailyMissionXpTotal + weeklyMissionXpTotal,
    total: totalXp,
  }
  const monthlyWorkoutCount = input.workoutHistory.filter((entry) => {
    const completedAt = new Date(entry.completedAt)
    const anchorDate = new Date(`${input.anchorDate}T12:00:00`)

    return completedAt.getMonth() === anchorDate.getMonth() && completedAt.getFullYear() === anchorDate.getFullYear()
  }).length
  const monthlyCardioMinutes = input.cardioHistory.reduce((total, entry) => {
    const completedAt = new Date(entry.endedAt ?? entry.startedAt)
    const anchorDate = new Date(`${input.anchorDate}T12:00:00`)

    if (completedAt.getMonth() !== anchorDate.getMonth() || completedAt.getFullYear() !== anchorDate.getFullYear()) {
      return total
    }

    return total + getCardioDurationMin(entry)
  }, 0)
  const last7Dates = Array.from({ length: 7 }, (_, index) => addDays(input.anchorDate, -index))
  const averageWaterMl = Math.round(
    last7Dates.reduce((total, dateKey) => {
      const day = input.nutritionDays.find((entry) => entry.date === dateKey)
      return total + (day?.consumed.waterMl ?? 0)
    }, 0) / Math.max(last7Dates.length, 1),
  )
  const nutritionAdherencePct = Math.round(
    last7Dates.reduce((total, dateKey) => {
      const day = input.nutritionDays.find((entry) => entry.date === dateKey)

      if (!day || day.meals.length === 0) {
        return total
      }

      return total + (countCompletedMeals(day) / day.meals.length) * 100
    }, 0) / Math.max(last7Dates.length, 1),
  )

  return {
    ...toLevelProgress(totalXp),
    totalXp,
    weeklyStreak,
    weeklyXp,
    weeklyXpTarget,
    todayXp,
    todayStars,
    totalStars,
    streakDays,
    xpBreakdown,
    dailyMissions,
    weeklyMissions,
    activityHeatmap,
    monthlyWorkoutCount,
    monthlyCardioMinutes,
    averageWaterMl,
    nutritionAdherencePct,
  }
}
