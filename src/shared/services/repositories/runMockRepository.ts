import { RUN_ACTIVE_SESSION_STORAGE_KEY, RUN_HISTORY_STORAGE_KEY } from '@/shared/constants'
import type { RunSession } from '@/shared/services/contracts/run'
import { storage } from '@/shared/services/storage'

export const runMockRepository = {
  getActiveSession(): RunSession | null {
    return storage.get<RunSession>(RUN_ACTIVE_SESSION_STORAGE_KEY)
  },
  saveActiveSession(session: RunSession) {
    storage.set(RUN_ACTIVE_SESSION_STORAGE_KEY, session)
  },
  clearActiveSession() {
    storage.remove(RUN_ACTIVE_SESSION_STORAGE_KEY)
  },
  getHistory(): RunSession[] {
    return storage.get<RunSession[]>(RUN_HISTORY_STORAGE_KEY) ?? []
  },
  saveHistory(history: RunSession[]) {
    storage.set(RUN_HISTORY_STORAGE_KEY, history)
  },
  appendHistory(session: RunSession) {
    const history = this.getHistory()
    const next = [session, ...history.filter((item) => item.sessionId !== session.sessionId)].slice(0, 120)
    this.saveHistory(next)
  },
}
