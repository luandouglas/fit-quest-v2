import {
  collection,
  doc,
  getDoc,
  setDoc,
  type CollectionReference,
  type DocumentReference,
} from 'firebase/firestore/lite'

import { authService } from '@/shared/services/authService'
import { getFirebaseFirestore } from '@/shared/services/firebase'
import type { BodyMeasurements, ProgressOverview, ProgressRange } from '@/shared/services/contracts/progress'

import type { ProgressRepository } from './progressRepository'

function getDb() {
  const db = getFirebaseFirestore()

  if (!db) {
    throw new Error('Firebase is not configured for progress data.')
  }

  return db
}

function resolveStudentId() {
  const session = authService.getStoredSession()

  if (!session || session.user.role !== 'STUDENT') {
    throw new Error('Authenticated student session is required for progress data.')
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

function getRangeDays(range: ProgressRange) {
  if (range === '7d') {
    return 7
  }

  if (range === '90d') {
    return 90
  }

  return 30
}

function createDefaultProgressOverview(range: ProgressRange): ProgressOverview {
  const today = new Date()
  const totalDays = getRangeDays(range)
  const chart = Array.from({ length: totalDays }, (_, index) => {
    const current = new Date(today)
    current.setDate(today.getDate() - (totalDays - index - 1))

    return {
      date: toIsoDate(current),
      completedTrainings: 0,
      completedWorkouts: 0,
      completedRuns: 0,
      runDistanceKm: 0,
      durationMin: 0,
      waterMl: 0,
      waterGoalMl: 2500,
      caloriesEstimated: 0,
      weightKg: null,
    }
  })

  return {
    range,
    monthSummary: {
      completedWorkouts: 0,
      totalTrainingMin: 0,
      completedRuns: 0,
      totalRunKm: 0,
      hydrationAdherencePct: 0,
      nutritionConsistencyPct: 0,
      activeDays: 0,
    },
    weeklySummary: {
      completedTrainings: 0,
      targetTrainings: 3,
      totalDurationMin: 0,
      averageCompletionPct: 0,
      completedRuns: 0,
      nutritionConsistencyPct: 0,
      waterAdherencePct: 0,
      activeDays: 0,
    },
    metrics: {
      currentWeightKg: 0,
      weightDeltaKg: 0,
      workoutsPerWeek: 0,
      avgWaterMl: 0,
      estimatedCalories: 0,
      heightCm: 0,
      bmi: 0,
    },
    bodyComposition: {
      heightCm: 0,
      bmi: 0,
      bmiStatus: 'healthy',
      latestMeasurements: null,
      previousMeasurements: null,
    },
    comparisons: {
      weekly: {
        workouts: { current: 0, previous: 0, deltaValue: 0, deltaPct: 0, trend: 'stable' },
        cardioSessions: { current: 0, previous: 0, deltaValue: 0, deltaPct: 0, trend: 'stable' },
        nutritionConsistencyPct: { current: 0, previous: 0, deltaValue: 0, deltaPct: 0, trend: 'stable' },
        waterAdherencePct: { current: 0, previous: 0, deltaValue: 0, deltaPct: 0, trend: 'stable' },
      },
      monthly: {
        trainingMin: { current: 0, previous: 0, deltaValue: 0, deltaPct: 0, trend: 'stable' },
        cardioDistanceKm: { current: 0, previous: 0, deltaValue: 0, deltaPct: 0, trend: 'stable' },
        activeDays: { current: 0, previous: 0, deltaValue: 0, deltaPct: 0, trend: 'stable' },
      },
    },
    strengthPrs: [],
    strengthWeeklyVolume: [],
    weightTrend: {
      trend7dKg: 0,
      trend30dKg: 0,
    },
    measurementSummary: {
      lastUpdatedAt: null,
      lastUpdatedByLabel: 'Sem registros',
    },
    insights: [],
    chart,
    weightHistory: [],
    weightLogs: [],
    bodyMeasurementLogs: [],
    recentHistory: [],
    cardioHistory: [],
  }
}

export const progressFirebaseRepository: ProgressRepository = {
  source: 'firebase',
  async getOverview(range: ProgressRange): Promise<ProgressOverview> {
    const studentId = resolveStudentId()
    const reference = studentDoc<ProgressOverview>(studentId, 'progressOverviews', range)
    const snapshot = await getDoc(reference)

    if (!snapshot.exists()) {
      const fallback = createDefaultProgressOverview(range)
      await setDoc(reference, fallback, { merge: true })
      return fallback
    }

    return snapshot.data()
  },
  async registerWeight(params: { weightKg: number; date?: string }): Promise<{ saved: boolean }> {
    const studentId = resolveStudentId()
    const weightKg = Number(params.weightKg)

    if (!Number.isFinite(weightKg) || weightKg <= 0) {
      throw new Error('A positive weightKg is required.')
    }

    await setDoc(
      doc(studentCollection(studentId, 'progressWeightLogs')),
      {
        id: crypto.randomUUID(),
        studentId,
        date: params.date ?? new Date().toISOString().slice(0, 10),
        weightKg: Number(weightKg.toFixed(1)),
        recordedByRole: 'STUDENT',
        recordedById: studentId,
        createdAt: new Date().toISOString(),
      },
      { merge: true },
    )

    return { saved: true }
  },
  async registerBodyMeasurements(params: {
    measurements: BodyMeasurements
    date?: string
    comment?: string
  }): Promise<{ saved: boolean }> {
    void params
    throw new Error('Body measurements can only be updated by professionals.')
  },
  async requestMeasurementsUpdate(params?: { note?: string }): Promise<{ sent: boolean }> {
    const studentId = resolveStudentId()

    await setDoc(
      doc(studentCollection(studentId, 'measurementRequests')),
      {
        id: crypto.randomUUID(),
        studentId,
        note: params?.note?.trim() || null,
        status: 'requested',
        createdAt: new Date().toISOString(),
      },
      { merge: true },
    )

    return { sent: true }
  },
}
