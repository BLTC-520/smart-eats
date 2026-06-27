import { getEnv } from '@/lib/env'

export class GrabApiError extends Error {
  readonly status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'GrabApiError'
    this.status = status
  }
}

type QueryValue = string | number | readonly string[]

function buildUrl(baseUrl: string, path: string, params: Record<string, QueryValue>): string {
  const url = new URL(`${baseUrl}${path}`)
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      for (const item of value) url.searchParams.append(key, String(item))
    } else {
      url.searchParams.set(key, String(value))
    }
  }
  return url.toString()
}

/** Authenticated GET against the GrabMaps gateway. Throws GrabApiError on failure.
 *  The API key is read server-side only and never exposed to the client. */
export async function grabGet(path: string, params: Record<string, QueryValue>): Promise<unknown> {
  const env = getEnv()
  const url = buildUrl(env.grabBaseUrl, path, params)

  let response: Response
  try {
    response = await fetch(url, {
      headers: { Authorization: `Bearer ${env.grabApiKey}` },
      // Grab data is stable for minutes; cache to ease rate limits.
      next: { revalidate: 60 },
    })
  } catch {
    throw new GrabApiError('无法连接 GrabMaps 服务', 0)
  }

  if (!response.ok) {
    throw new GrabApiError(`GrabMaps 请求失败 (${response.status})`, response.status)
  }
  return response.json()
}
