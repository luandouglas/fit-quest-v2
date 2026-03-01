import type { HttpErrorCode, HttpRequestContext } from './types'

export class HttpError extends Error {
  readonly status: number | null
  readonly code: HttpErrorCode
  readonly data: unknown
  readonly request: HttpRequestContext

  constructor(message: string, params: { status?: number | null; code?: HttpErrorCode; data?: unknown; request: HttpRequestContext }) {
    super(message)
    this.name = 'HttpError'
    this.status = params.status ?? null
    this.code = params.code ?? 'unknown'
    this.data = params.data
    this.request = params.request
  }
}
