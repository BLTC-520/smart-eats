import type { Restaurant } from '@/lib/grab/provider'
import type { Preferences } from '@/lib/prefs/schema'

const DEFAULT_KEYWORD = 'restaurant'
const LIKE_WEIGHT = 3
const BASE_WEIGHT = 1

/** Keywords to query the provider with, derived from preferred cuisines. */
export function deriveSearchKeywords(prefs: Pick<Preferences, 'cuisines'>): string[] {
  const cuisines = prefs.cuisines.map((c) => c.trim()).filter((c) => c.length > 0)
  return cuisines.length > 0 ? cuisines : [DEFAULT_KEYWORD]
}

function haystack(restaurant: Restaurant): string {
  return `${restaurant.name} ${restaurant.category ?? ''} ${restaurant.cuisines.join(' ')}`.toLowerCase()
}

function matchesAny(restaurant: Restaurant, keywords: readonly string[]): boolean {
  if (keywords.length === 0) return false
  const text = haystack(restaurant)
  return keywords.some((keyword) => {
    const needle = keyword.trim().toLowerCase()
    return needle.length > 0 && text.includes(needle)
  })
}

/** True when the restaurant matches a disliked keyword and should be excluded. */
export function isDisliked(restaurant: Restaurant, prefs: Pick<Preferences, 'dislikes'>): boolean {
  return matchesAny(restaurant, prefs.dislikes)
}

/** Selection weight (>= 1); liked places are more likely to be chosen. */
export function likeWeight(restaurant: Restaurant, prefs: Pick<Preferences, 'likes'>): number {
  return matchesAny(restaurant, prefs.likes) ? LIKE_WEIGHT : BASE_WEIGHT
}
