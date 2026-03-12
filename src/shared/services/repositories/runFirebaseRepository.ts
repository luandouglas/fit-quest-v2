import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  type CollectionReference,
  type DocumentReference,
} from 'firebase/firestore/lite'

import { authService } from '@/shared/services/authService'
import { getFirebaseFirestore } from '@/shared/services/firebase'
import type { RunOverview, RunRankingSnapshot, RunSession, StartRunInput } from '@/shared/services/contracts/run'

import type { RunRepository } from './runRepository'

function getDb() {
  const db = getFirebaseFirestore()

  if (!db) {
    throw new Error('Firebase is not configured for cardio data.')
  }

  return db
}

function resolveStudentId() {
  const session = authService.getStoredSession()

  if (!session || session.user.role !== 'STUDENT') {
    throw new Error('Authenticated student session is required for cardio data.')
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

function startOfWeek(date: Date) {
  const nextDate = new Date(date)
  const day = nextDate.getDay()
  const diff = (day + 6) % 7
  nextDate.setDate(nextDate.getDate() - diff)
  nextDate.setHours(0, 0, 0, 0)
  return nextDate
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate
}

function calculateCalories(distanceKm: number, activityType: RunSession['activityType']) {
  const factor = activityType === 'run' ? 68 : 52
  return Math.max(Math.round(distanceKm * factor), 0)
}

function calculateStars(session: Pick<RunSession, 'distanceKm' | 'elapsedSec' | 'activityType'>) {
  const base = session.activityType === 'run' ? 16 : 12
  return base + Math.round(session.distanceKm * 8) + Math.round(session.elapsedSec / 900) * 2
}

function calculateProgressImpact(distanceKm: number, elapsedSec: number) {
  const elapsedMinutes = elapsedSec / 60
  return Math.min(Math.round(distanceKm * 7 + elapsedMinutes * 0.6), 35)
}

function normalizeSession(session: RunSession): RunSession {
  const distanceKm = Number(Math.max(session.distanceKm, 0).toFixed(2))
  const calories = calculateCalories(distanceKm, session.activityType)
  const paceSecPerKm = distanceKm > 0 ? Math.round(session.elapsedSec / Math.max(distanceKm, 0.01)) : 0

  return {
    ...session,
    distanceKm,
    calories,
    paceSecPerKm,
    starsEarned: session.status === 'completed' ? calculateStars({ ...session, distanceKm }) : 0,
    progressImpactPct:
      session.status === 'completed' ? calculateProgressImpact(distanceKm, session.elapsedSec) : 0,
  }
}

function calculateStreak(history: RunSession[]) {
  const uniqueDates = new Set(history.map((entry) => toIsoDate(new Date(entry.endedAt ?? entry.startedAt))))
  let streak = 0

  for (let offset = 0; offset < 30; offset += 1) {
    const dateKey = toIsoDate(addDays(new Date(), -offset))

    if (uniqueDates.has(dateKey)) {
      streak += 1
      continue
    }

    break
  }

  return streak
}

function calculateMetrics(history: RunSession[]): RunOverview['metrics'] {
  const now = new Date()
  const month = now.getMonth()
  const year = now.getFullYear()
  const weekStart = startOfWeek(now)
  const currentMonth = history.filter((entry) => {
    const date = new Date(entry.endedAt ?? entry.startedAt)
    return date.getMonth() === month && date.getFullYear() === year
  })
  const validPaces = currentMonth.map((entry) => entry.paceSecPerKm).filter((entry) => entry > 0)

  return {
    totalKmMonth: Number(currentMonth.reduce((total, entry) => total + entry.distanceKm, 0).toFixed(2)),
    bestPaceSecPerKm: validPaces.length ? Math.min(...validPaces) : null,
    totalCalories: Math.round(currentMonth.reduce((total, entry) => total + entry.calories, 0)),
    totalSessionsMonth: currentMonth.length,
    weeklyDistanceKm: Number(
      history
        .filter((entry) => new Date(entry.endedAt ?? entry.startedAt) >= weekStart)
        .reduce((total, entry) => total + entry.distanceKm, 0)
        .toFixed(2),
    ),
    weeklyStars: history
      .filter((entry) => new Date(entry.endedAt ?? entry.startedAt) >= weekStart)
      .reduce((total, entry) => total + entry.starsEarned, 0),
  }
}

async function getHistory(studentId: string) {
  const snapshot = await getDocs(query(studentCollection<RunSession>(studentId, 'cardioHistory'), orderBy('endedAt', 'desc')))
  return snapshot.docs.map((entry) => entry.data())
}

export const runFirebaseRepository: RunRepository = {
  source: 'firebase',
  async getOverview(): Promise<RunOverview> {
    const studentId = resolveStudentId()
    const [history, activeSnapshot] = await Promise.all([
      getHistory(studentId),
      getDoc(studentDoc<RunSession>(studentId, 'cardioSessions', 'active')),
    ])
    const activeSession = activeSnapshot.exists() ? activeSnapshot.data() : null
    const todayKey = toIsoDate(new Date())
    const todayEntries = history.filter((entry) => toIsoDate(new Date(entry.endedAt ?? entry.startedAt)) === todayKey)

    return {
      activeSession,
      history,
      metrics: calculateMetrics(history),
      recommendedGoalKm: 4,
      todayDistanceKm: Number(todayEntries.reduce((total, entry) => total + entry.distanceKm, 0).toFixed(2)),
      todayStars: todayEntries.reduce((total, entry) => total + entry.starsEarned, 0),
      streakDays: calculateStreak(history),
    }
  },
  async getRankingSnapshot(): Promise<RunRankingSnapshot> {
    const overview = await this.getOverview()
    const points = Math.round(overview.metrics.weeklyDistanceKm * 18 + overview.metrics.weeklyStars)

    return {
      points,
      position: Math.max(1, 120 - Math.min(Math.round(points / 10), 119)),
      totalAthletes: 120,
    }
  },
  async getLastCompletedSession(): Promise<RunSession | null> {
    const studentId = resolveStudentId()
    const history = await getHistory(studentId)
    return history[0] ?? null
  },
  async startRun(input?: StartRunInput): Promise<RunSession> {
    const studentId = resolveStudentId()
    const existing = await getDoc(studentDoc<RunSession>(studentId, 'cardioSessions', 'active'))

    if (existing.exists()) {
      return existing.data()
    }

    const session: RunSession = {
      sessionId: crypto.randomUUID(),
      studentId,
      activityType: input?.activityType ?? 'run',
      startedAt: new Date().toISOString(),
      status: 'active',
      elapsedSec: 0,
      distanceKm: 0,
      calories: 0,
      paceSecPerKm: 0,
      starsEarned: 0,
      progressImpactPct: 0,
      source: 'manual',
    }

    await setDoc(studentDoc(studentId, 'cardioSessions', 'active'), session, { merge: true })
    return session
  },
  async updateRunProgress(session: RunSession): Promise<RunSession> {
    const studentId = resolveStudentId()
    const normalized = normalizeSession(session)
    await setDoc(studentDoc(studentId, 'cardioSessions', 'active'), normalized, { merge: true })
    return normalized
  },
  async finishRun(session: RunSession): Promise<RunSession> {
    const studentId = resolveStudentId()
    const endedAt = new Date().toISOString()
    const elapsedSec = Math.max(
      session.elapsedSec,
      Math.round((Date.parse(endedAt) - Date.parse(session.startedAt)) / 1000),
    )
    const completed = normalizeSession({
      ...session,
      endedAt,
      elapsedSec,
      status: 'completed',
    })

    await Promise.all([
      setDoc(studentDoc(studentId, 'cardioHistory', completed.sessionId), completed, { merge: true }),
      setDoc(studentDoc(studentId, 'cardioSessions', 'lastCompleted'), completed, { merge: true }),
      setDoc(
        studentDoc(studentId, 'cardioSessions', toIsoDate(new Date(completed.endedAt ?? completed.startedAt))),
        {
          id: completed.sessionId,
          date: toIsoDate(new Date(completed.endedAt ?? completed.startedAt)),
          title: completed.activityType === 'run' ? 'Corrida concluida' : 'Caminhada concluida',
          type: completed.activityType,
          status: 'completed',
          intensity: completed.distanceKm >= 6 ? 'high' : completed.distanceKm >= 3 ? 'moderate' : 'low',
          goalDurationMin: 30,
          completedDurationMin: Math.max(Math.round(completed.elapsedSec / 60), 1),
          targetDistanceKm: 4,
          completedDistanceKm: completed.distanceKm,
        },
        { merge: true },
      ),
      deleteDoc(studentDoc(studentId, 'cardioSessions', 'active')),
    ])

    return completed
  },
}
