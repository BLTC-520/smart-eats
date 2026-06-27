import { Redis } from '@upstash/redis'
import { getEnv } from '@/lib/env'
import { defaultPreferences, preferencesSchema, type Preferences } from '@/lib/prefs/schema'

const PREFS_KEY = 'wanxuan:prefs'

/** Storage for the single shared preferences document. */
export interface PrefsStore {
  get(): Promise<Preferences>
  set(preferences: Preferences): Promise<void>
}

/** Cloud-shared store (both phones read/write the same document). */
class RedisPrefsStore implements PrefsStore {
  private readonly redis: Redis

  constructor(url: string, token: string) {
    this.redis = new Redis({ url, token })
  }

  async get(): Promise<Preferences> {
    const raw = await this.redis.get<unknown>(PREFS_KEY)
    if (raw == null) return defaultPreferences
    const parsed = preferencesSchema.safeParse(raw)
    return parsed.success ? parsed.data : defaultPreferences
  }

  async set(preferences: Preferences): Promise<void> {
    await this.redis.set(PREFS_KEY, preferences)
  }
}

/** In-memory fallback for local dev when Upstash is not configured.
 *  Not durable across server restarts — configure Upstash for real sharing. */
let memoryValue: Preferences = defaultPreferences

class MemoryPrefsStore implements PrefsStore {
  async get(): Promise<Preferences> {
    return memoryValue
  }

  async set(preferences: Preferences): Promise<void> {
    memoryValue = preferences
  }
}

export function getPrefsStore(): PrefsStore {
  const env = getEnv()
  if (env.upstashUrl && env.upstashToken) {
    return new RedisPrefsStore(env.upstashUrl, env.upstashToken)
  }
  return new MemoryPrefsStore()
}
