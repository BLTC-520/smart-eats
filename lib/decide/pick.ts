import type { Restaurant } from '@/lib/grab/provider'
import type { Preferences } from '@/lib/prefs/schema'
import { isDisliked, likeWeight } from '@/lib/decide/cuisine'

export interface PickOptions {
  excludeIds?: readonly string[]
  /** Injectable RNG in [0, 1) for deterministic tests. */
  random?: () => number
}

/** Filter candidates by preferences and exclusion list (pure, no mutation). */
export function filterCandidates<T extends Restaurant>(
  candidates: readonly T[],
  prefs: Preferences,
  excludeIds: readonly string[] = [],
): T[] {
  const excluded = new Set(excludeIds)
  return candidates.filter((restaurant) => {
    if (excluded.has(restaurant.id)) return false
    if (isDisliked(restaurant, prefs)) return false
    if (prefs.onlyOpenNow && restaurant.openNow === false) return false
    return true
  })
}

/** Pick one restaurant via like-weighted random; returns null when none qualify. */
export function pickRestaurant<T extends Restaurant>(
  candidates: readonly T[],
  prefs: Preferences,
  options: PickOptions = {},
): T | null {
  const { excludeIds = [], random = Math.random } = options
  const eligible = filterCandidates(candidates, prefs, excludeIds)
  if (eligible.length === 0) return null

  const weights = eligible.map((restaurant) => likeWeight(restaurant, prefs))
  const total = weights.reduce((sum, weight) => sum + weight, 0)
  let threshold = random() * total
  for (let i = 0; i < eligible.length; i++) {
    threshold -= weights[i]
    if (threshold < 0) return eligible[i]
  }
  return eligible[eligible.length - 1]
}
