import { HttpError } from './errors'
import type { HttpMethod, HttpRequestContext, HttpResponse } from './types'

type MockReply<TData = unknown> = {
  status?: number
  data: TData
  headers?: Record<string, string>
}

type MockHandler<TData = unknown> = (request: HttpRequestContext) => MockReply<TData> | Promise<MockReply<TData>>

const handlers = new Map<string, MockHandler>()

function routeKey(method: HttpMethod, path: string) {
  return `${method}:${path}`
}

function toHeadersObject(headers?: Record<string, string>) {
  return headers ?? {}
}

export function registerMockHandler<TData>(method: HttpMethod, path: string, handler: MockHandler<TData>) {
  handlers.set(routeKey(method, path), handler as MockHandler)
}

export function hasMockHandler(method: HttpMethod, path: string) {
  return handlers.has(routeKey(method, path))
}

export async function mockRequest<TData>(request: HttpRequestContext): Promise<HttpResponse<TData>> {
  const key = routeKey(request.method, request.path)
  const handler = handlers.get(key)

  if (!handler) {
    throw new HttpError(`No mock handler registered for ${key}`, {
      code: 'mock_not_found',
      request,
    })
  }

  const reply = await handler(request)

  return {
    status: reply.status ?? 200,
    data: reply.data as TData,
    headers: toHeadersObject(reply.headers),
    request,
  }
}
