export const storage = {
  get<T>(key: string): T | null {
    const raw = window.localStorage.getItem(key)

    if (!raw) {
      return null
    }

    try {
      return JSON.parse(raw) as T
    } catch {
      window.localStorage.removeItem(key)
      return null
    }
  },
  set<T>(key: string, value: T) {
    window.localStorage.setItem(key, JSON.stringify(value))
  },
  remove(key: string) {
    window.localStorage.removeItem(key)
  },
}
