export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export type HttpQuery = Record<string, string | number | boolean | null | undefined>

export type HttpHeaders = Record<string, string>

export type HttpRequestConfig<TBody = unknown> = {
  method: HttpMethod
  path: string
  query?: HttpQuery
  headers?: HttpHeaders
  body?: TBody
  timeoutMs?: number
}

export type HttpRequestContext<TBody = unknown> = HttpRequestConfig<TBody> & {
  url: string
  requestId: string
}

export type HttpResponse<TData> = {
  status: number
  data: TData
  headers: HttpHeaders
  request: HttpRequestContext
}

export type HttpErrorCode = 'timeout' | 'network' | 'http_error' | 'mock_not_found' | 'unknown'
