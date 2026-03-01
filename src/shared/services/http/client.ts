import { HTTP_TIMEOUT_MS, getHttpBaseUrl, isHttpLogEnabled, isHttpMockEnabled } from './config'
import { HttpError } from './errors'
import { fetchRequest } from './fetchTransport'
import { mockRequest } from './mockTransport'
import type { HttpHeaders, HttpMethod, HttpQuery, HttpRequestConfig, HttpRequestContext, HttpResponse } from './types'

export type HttpClientMiddleware = {
  onRequest?: (request: HttpRequestContext) => HttpRequestContext | Promise<HttpRequestContext>
  onResponse?: <TData>(response: HttpResponse<TData>) => HttpResponse<TData> | Promise<HttpResponse<TData>>
  onError?: (error: unknown, request: HttpRequestContext) => unknown
}

const middlewares: HttpClientMiddleware[] = []

let accessToken: string | null = null

function withQuery(url: string, query?: HttpQuery) {
  if (!query) {
    return url
  }

  const queryParams = new URLSearchParams()

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return
    }

    queryParams.set(key, String(value))
  })

  const qs = queryParams.toString()

  if (!qs) {
    return url
  }

  return `${url}${url.includes('?') ? '&' : '?'}${qs}`
}

function buildHeaders(headers?: HttpHeaders) {
  return {
    'content-type': 'application/json',
    ...headers,
  }
}

function buildRequestContext<TBody>(config: HttpRequestConfig<TBody>): HttpRequestContext<TBody> {
  const baseURL = getHttpBaseUrl().replace(/\/$/, '')
  const path = config.path.startsWith('/') ? config.path : `/${config.path}`

  return {
    ...config,
    path,
    headers: buildHeaders(config.headers),
    timeoutMs: config.timeoutMs ?? HTTP_TIMEOUT_MS,
    requestId: crypto.randomUUID(),
    url: withQuery(`${baseURL}${path}`, config.query),
  }
}

function authMiddleware(): HttpClientMiddleware {
  return {
    onRequest(request) {
      if (!accessToken) {
        return request
      }

      return {
        ...request,
        headers: {
          ...request.headers,
          authorization: `Bearer ${accessToken}`,
        },
      }
    },
  }
}

function refreshPlaceholderMiddleware(): HttpClientMiddleware {
  return {
    onError(error, request) {
      if (error instanceof HttpError && error.status === 401) {
        if (import.meta.env.DEV) {
          console.warn(`[http][refresh-placeholder] 401 received for ${request.method} ${request.path}`)
        }
      }

      return error
    },
  }
}

function devLoggerMiddleware(): HttpClientMiddleware {
  return {
    onRequest(request) {
      if (isHttpLogEnabled()) {
        console.info(`[http][request] ${request.method} ${request.path}`, {
          requestId: request.requestId,
          query: request.query,
        })
      }

      return request
    },
    onResponse(response) {
      if (isHttpLogEnabled()) {
        console.info(`[http][response] ${response.request.method} ${response.request.path}`, {
          requestId: response.request.requestId,
          status: response.status,
        })
      }

      return response
    },
    onError(error, request) {
      if (isHttpLogEnabled()) {
        console.error(`[http][error] ${request.method} ${request.path}`, {
          requestId: request.requestId,
          error,
        })
      }

      return error
    },
  }
}

middlewares.push(authMiddleware(), refreshPlaceholderMiddleware(), devLoggerMiddleware())

export function setHttpAccessToken(token: string | null) {
  accessToken = token
}

export function addHttpMiddleware(middleware: HttpClientMiddleware) {
  middlewares.push(middleware)
}

async function runRequestMiddlewares(request: HttpRequestContext) {
  let nextRequest = request

  for (const middleware of middlewares) {
    if (!middleware.onRequest) {
      continue
    }

    nextRequest = await middleware.onRequest(nextRequest)
  }

  return nextRequest
}

async function runResponseMiddlewares<TData>(response: HttpResponse<TData>) {
  let nextResponse = response

  for (const middleware of middlewares) {
    if (!middleware.onResponse) {
      continue
    }

    nextResponse = await middleware.onResponse(nextResponse)
  }

  return nextResponse
}

function runErrorMiddlewares(error: unknown, request: HttpRequestContext) {
  let nextError = error

  for (const middleware of middlewares) {
    if (!middleware.onError) {
      continue
    }

    nextError = middleware.onError(nextError, request)
  }

  return nextError
}

async function request<TResponse, TBody = unknown>(config: HttpRequestConfig<TBody>): Promise<TResponse> {
  const requestContext = await runRequestMiddlewares(buildRequestContext(config))

  try {
    const response = isHttpMockEnabled()
      ? await mockRequest<TResponse>(requestContext)
      : await fetchRequest<TResponse>(requestContext)

    if (response.status >= 400) {
      throw new HttpError(`HTTP ${response.status} for ${requestContext.method} ${requestContext.path}`, {
        status: response.status,
        code: 'http_error',
        data: response.data,
        request: requestContext,
      })
    }

    const handledResponse = await runResponseMiddlewares(response)
    return handledResponse.data
  } catch (error) {
    throw runErrorMiddlewares(error, requestContext)
  }
}

export const httpClient = {
  request,
  get<TResponse>(path: string, config: Omit<HttpRequestConfig, 'method' | 'path' | 'body'> = {}) {
    return request<TResponse>({ ...config, method: 'GET', path })
  },
  post<TResponse, TBody = unknown>(path: string, body?: TBody, config: Omit<HttpRequestConfig<TBody>, 'method' | 'path' | 'body'> = {}) {
    return request<TResponse, TBody>({ ...config, method: 'POST', path, body })
  },
  put<TResponse, TBody = unknown>(path: string, body?: TBody, config: Omit<HttpRequestConfig<TBody>, 'method' | 'path' | 'body'> = {}) {
    return request<TResponse, TBody>({ ...config, method: 'PUT', path, body })
  },
  patch<TResponse, TBody = unknown>(path: string, body?: TBody, config: Omit<HttpRequestConfig<TBody>, 'method' | 'path' | 'body'> = {}) {
    return request<TResponse, TBody>({ ...config, method: 'PATCH', path, body })
  },
  delete<TResponse>(path: string, config: Omit<HttpRequestConfig, 'method' | 'path' | 'body'> = {}) {
    return request<TResponse>({ ...config, method: 'DELETE', path })
  },
}

export type { HttpMethod }
