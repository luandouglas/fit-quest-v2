import {
  collection,
  doc,
  getDoc,
  getDocs,
  type CollectionReference,
  type DocumentReference,
} from 'firebase/firestore/lite'

import { authService } from '@/shared/services/authService'
import { getFirebaseFirestore } from '@/shared/services/firebase'
import type { NutritionDay } from '@/shared/services/contracts/nutrition'
import type { GamificationOverview } from '@/shared/services/contracts/gamification'

import type { GamificationRepository } from './gamificationRepository'
import { deriveStudentActivityMetrics } from './studentActivityDerivations'

function getDb() {
  const db = getFirebaseFirestore()

  if (!db) {
    throw new Error('Firebase is not configured for gamification data.')
  }

  return db
}

function resolveStudentId() {
  const session = authService.getStoredSession()

  if (!session || session.user.role !== 'STUDENT') {
    throw new Error('Authenticated student session is required for gamification data.')
  }

  return session.user.id
}

function studentDoc<T>(studentId: string, ...segments: string[]) {
  return doc(getDb(), 'students', studentId, ...segments) as DocumentReference<T>
}

function studentCollection<T>(studentId: string, ...segments: string[]) {
  return collection(getDb(), 'students', studentId, ...segments) as CollectionReference<T>
}

function toIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function createEmptyOverview(): GamificationOverview {
  return {
    level: 1,
    totalXp: 0,
    currentLevelXp: 0,
    nextLevelXp: 400,
    weeklyStreak: 0,
    weeklyXp: 0,
    weeklyXpTarget: 1000,
    todayXp: 0,
    xpBreakdown: {
      workout: 0,
      nutrition: 0,
      hydration: 0,
      run: 0,
      professional: 0,
      mission: 0,
      total: 0,
    },
    dailyMissions: [],
    weeklyMissions: [],
    dailyResetAt: new Date().toISOString(),
    weeklyResetAt: new Date().toISOString(),
    badges: [],
    achievementsByCategory: {
      WORKOUT: [],
      NUTRITION: [],
      HABIT: [],
      RUN: [],
    },
    xpLedger: [],
    activityHeatmap: [],
  }
}

function mergeMissions(
  current: GamificationOverview['dailyMissions'] | GamificationOverview['weeklyMissions'],
  derived: GamificationOverview['dailyMissions'] | GamificationOverview['weeklyMissions'],
) {
  if (current.length === 0) {
    return derived
  }

  return current.map((mission) => {
    const nextMission = derived.find((entry) => entry.id === mission.id)

    return nextMission
      ? {
          ...mission,
          current: nextMission.current,
          target: nextMission.target,
          rewardXp: nextMission.rewardXp,
          completed: nextMission.completed,
        }
      : mission
  })
}

export const gamificationFirebaseRepository: GamificationRepository = {
  source: 'firebase',
  async getOverview(): Promise<GamificationOverview> {
    const studentId = resolveStudentId()
    const [overviewSnapshot, workoutHistorySnapshot, cardioHistorySnapshot, nutritionDaysSnapshot] = await Promise.all([
      getDoc(studentDoc<GamificationOverview>(studentId, 'gamification', 'overview')),
      getDocs(
        studentCollection<{ completedAt: string; rewardStars: number; completionPct?: number; durationSec?: number }>(
          studentId,
          'workoutSessionsHistory',
        ),
      ),
      getDocs(
        studentCollection<{ startedAt: string; endedAt?: string; distanceKm?: number; elapsedSec?: number; starsEarned?: number }>(
          studentId,
          'cardioHistory',
        ),
      ),
      getDocs(studentCollection<NutritionDay>(studentId, 'nutritionDays')),
    ])
    const baseOverview = overviewSnapshot.exists() ? overviewSnapshot.data() : createEmptyOverview()
    const anchorDate = toIsoDate(new Date())
    const derived = deriveStudentActivityMetrics({
      anchorDate,
      workoutHistory: workoutHistorySnapshot.docs.map((entry) => entry.data()),
      cardioHistory: cardioHistorySnapshot.docs.map((entry) => entry.data()),
      nutritionDays: nutritionDaysSnapshot.docs.map((entry) => entry.data()),
      weeklyXpTarget: baseOverview.weeklyXpTarget,
    })

    return {
      ...baseOverview,
      level: derived.level,
      totalXp: derived.totalXp,
      currentLevelXp: derived.currentLevelXp,
      nextLevelXp: derived.nextLevelXp,
      weeklyStreak: derived.weeklyStreak,
      weeklyXp: derived.weeklyXp,
      weeklyXpTarget: derived.weeklyXpTarget,
      todayXp: derived.todayXp,
      xpBreakdown: derived.xpBreakdown,
      dailyMissions: mergeMissions(baseOverview.dailyMissions, derived.dailyMissions),
      weeklyMissions: mergeMissions(baseOverview.weeklyMissions, derived.weeklyMissions),
      activityHeatmap: derived.activityHeatmap,
    }
  },
}
