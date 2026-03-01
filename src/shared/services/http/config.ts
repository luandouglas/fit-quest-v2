export const HTTP_TIMEOUT_MS = 10000

export function getHttpBaseUrl() {
  const configured = import.meta.env.VITE_API_BASE_URL
  return configured && configured.trim().length > 0 ? configured : '/api'
}

export function isHttpMockEnabled() {
  const envValue = import.meta.env.VITE_HTTP_MOCK

  if (envValue === 'true') {
    return true
  }

  if (envValue === 'false') {
    return false
  }

  return import.meta.env.DEV
}

export function isHttpLogEnabled() {
  const envValue = import.meta.env.VITE_HTTP_LOG

  if (envValue === 'true') {
    return true
  }

  if (envValue === 'false') {
    return false
  }

  return import.meta.env.DEV
}
