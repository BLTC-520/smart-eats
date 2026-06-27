/** Server-side environment configuration, validated on access. */

const DEFAULT_GRAB_BASE_URL = 'https://maps.grab.com/api/v1'

export interface AppEnv {
  grabApiKey: string
  grabBaseUrl: string
  upstashUrl?: string
  upstashToken?: string
  appPasscode?: string
}

function required(name: string): string {
  const value = process.env[name]
  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value.trim()
}

function optional(name: string): string | undefined {
  const value = process.env[name]?.trim()
  return value && value.length > 0 ? value : undefined
}

/** Read and validate environment. Throws if `GRAB_MAPS_API_KEY` is missing. */
export function getEnv(): AppEnv {
  return {
    grabApiKey: required('GRAB_MAPS_API_KEY'),
    grabBaseUrl: optional('GRAB_MAPS_BASE_URL') ?? DEFAULT_GRAB_BASE_URL,
    upstashUrl: optional('UPSTASH_REDIS_REST_URL'),
    upstashToken: optional('UPSTASH_REDIS_REST_TOKEN'),
    appPasscode: optional('APP_PASSCODE'),
  }
}
