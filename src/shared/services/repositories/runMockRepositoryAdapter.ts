import { authService } from '@/shared/services/authService'
import type { RunOverview, RunRankingSnapshot, RunSession, StartRunInput } from '@/shared/services/contracts/run'

import type { RunRepository } from './runRepository'
import { runMockRepository } from './runMockRepository'

function resolveStudentId() {
  const session = authService.getStoredSession()
  return session?.user.id ?? 'current-user'
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

function getStudentHistory(studentId: string) {
  return runMockRepository
    .getHistory()
    .filter((entry) => !entry.studentId || entry.studentId === studentId)
}

function createMetrics(history: RunSession[]): RunOverview['metrics'] {
  const now = new Date()
  const month = now.getMonth()
  const year = now.getFullYear()
  const weekStart = startOfWeek(now)
  const thisMonthRuns = history.filter((entry) => {
    const date = new Date(entry.endedAt ?? entry.startedAt)
    return date.getMonth() === month && date.getFullYear() === year
  })
  const validPaces = thisMonthRuns.map((entry) => entry.paceSecPerKm).filter((pace) => pace > 0)

  return {
    totalKmMonth: Number(thisMonthRuns.reduce((total, entry) => total + entry.distanceKm, 0).toFixed(2)),
    bestPaceSecPerKm: validPaces.length > 0 ? Math.min(...validPaces) : null,
    totalCalories: Math.round(thisMonthRuns.reduce((total, entry) => total + entry.calories, 0)),
    totalSessionsMonth: thisMonthRuns.length,
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

function createStreak(history: RunSession[]) {
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

export const runMockRepositoryAdapter: RunRepository = {
  source: 'mock',
  async getOverview(): Promise<RunOverview> {
    const studentId = resolveStudentId()
    const history = getStudentHistory(studentId)
    const todayKey = toIsoDate(new Date())
    const activeSession = runMockRepository.getActiveSession()
    const safeActiveSession =
      activeSession && (!activeSession.studentId || activeSession.studentId === studentId)
        ? activeSession
        : null
    const todayEntries = history.filter((entry) => toIsoDate(new Date(entry.endedAt ?? entry.startedAt)) === todayKey)

    return {
      activeSession: safeActiveSession,
      history,
      metrics: createMetrics(history),
      recommendedGoalKm: 4,
      todayDistanceKm: Number(todayEntries.reduce((total, entry) => total + entry.distanceKm, 0).toFixed(2)),
      todayStars: todayEntries.reduce((total, entry) => total + entry.starsEarned, 0),
      streakDays: createStreak(history),
    }
  },
  async getRankingSnapshot(): Promise<RunRankingSnapshot> {
    const overview = await this.getOverview()
    const points = Math.round(overview.metrics.weeklyDistanceKm * 18 + overview.metrics.weeklyStars)
    const totalAthletes = 124
    const position = Math.max(1, totalAthletes - Math.min(Math.round(points / 10), totalAthletes - 1))

    return {
      points,
      position,
      totalAthletes,
    }
  },
  async getLastCompletedSession(): Promise<RunSession | null> {
    const studentId = resolveStudentId()
    return getStudentHistory(studentId)[0] ?? null
  },
  async startRun(input?: StartRunInput): Promise<RunSession> {
    const studentId = resolveStudentId()
    const active = runMockRepository.getActiveSession()

    if (active && (!active.studentId || active.studentId === studentId) && active.status !== 'completed') {
      return active
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

    runMockRepository.saveActiveSession(session)
    return session
  },
  async updateRunProgress(session: RunSession): Promise<RunSession> {
    const normalized = normalizeSession(session)
    runMockRepository.saveActiveSession(normalized)
    return normalized
  },
  async finishRun(session: RunSession): Promise<RunSession> {
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

    runMockRepository.appendHistory(completed)
    runMockRepository.clearActiveSession()

    return completed
  },
}
