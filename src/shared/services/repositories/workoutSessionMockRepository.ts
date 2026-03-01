import {
  WORKOUT_ACTIVE_SESSION_STORAGE_KEY,
  WORKOUT_SESSION_HISTORY_STORAGE_KEY,
  WORKOUT_SESSION_SUMMARY_STORAGE_KEY,
} from '@/shared/constants'
import type { WorkoutSession, WorkoutSessionSummary } from '@/shared/services/contracts/workout'
import { storage } from '@/shared/services/storage'

export const workoutSessionMockRepository = {
  getActiveSession(): WorkoutSession | null {
    return storage.get<WorkoutSession>(WORKOUT_ACTIVE_SESSION_STORAGE_KEY)
  },
  saveActiveSession(session: WorkoutSession) {
    storage.set(WORKOUT_ACTIVE_SESSION_STORAGE_KEY, session)
  },
  clearActiveSession() {
    storage.remove(WORKOUT_ACTIVE_SESSION_STORAGE_KEY)
  },
  saveLastSummary(summary: WorkoutSessionSummary) {
    storage.set(WORKOUT_SESSION_SUMMARY_STORAGE_KEY, summary)
  },
  getLastSummary(): WorkoutSessionSummary | null {
    return storage.get<WorkoutSessionSummary>(WORKOUT_SESSION_SUMMARY_STORAGE_KEY)
  },
  getHistory(): WorkoutSessionSummary[] {
    return storage.get<WorkoutSessionSummary[]>(WORKOUT_SESSION_HISTORY_STORAGE_KEY) ?? []
  },
  saveHistory(history: WorkoutSessionSummary[]) {
    storage.set(WORKOUT_SESSION_HISTORY_STORAGE_KEY, history)
  },
  appendSummary(summary: WorkoutSessionSummary) {
    const history = this.getHistory()
    const nextHistory = [summary, ...history.filter((entry) => entry.sessionId !== summary.sessionId)].slice(0, 60)
    this.saveHistory(nextHistory)
  },
}
