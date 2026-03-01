import { HttpError } from './errors'
import type { HttpHeaders, HttpRequestContext, HttpResponse } from './types'

function toHeadersObject(headers: Headers): HttpHeaders {
  const result: HttpHeaders = {}

  headers.forEach((value, key) => {
    result[key] = value
  })

  return result
}

async function parseResponse(response: Response) {
  const contentType = response.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    return response.json()
  }

  const text = await response.text()
  return text.length ? text : null
}

export async function fetchRequest<TData>(request: HttpRequestContext): Promise<HttpResponse<TData>> {
  const controller = new AbortController()
  const timeoutMs = request.timeoutMs ?? 10000

  const timeoutId = window.setTimeout(() => {
    controller.abort(new DOMException('Request timeout', 'AbortError'))
  }, timeoutMs)

  try {
    const response = await fetch(request.url, {
      method: request.method,
      headers: request.headers,
      body: request.body !== undefined ? JSON.stringify(request.body) : undefined,
      signal: controller.signal,
    })

    const data = await parseResponse(response)

    if (!response.ok) {
      throw new HttpError(`HTTP ${response.status} for ${request.method} ${request.path}`, {
        status: response.status,
        code: 'http_error',
        data,
        request,
      })
    }

    return {
      status: response.status,
      data: data as TData,
      headers: toHeadersObject(response.headers),
      request,
    }
  } catch (error) {
    if (error instanceof HttpError) {
      throw error
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new HttpError(`Timeout while requesting ${request.method} ${request.path}`, {
        code: 'timeout',
        request,
      })
    }

    throw new HttpError(`Network error while requesting ${request.method} ${request.path}`, {
      code: 'network',
      data: error,
      request,
    })
  } finally {
    window.clearTimeout(timeoutId)
  }
}
