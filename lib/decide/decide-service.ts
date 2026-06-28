import type { LatLng, PlacesProvider, Restaurant } from '@/lib/grab/provider'
import type { Preferences } from '@/lib/prefs/schema'
import { deriveSearchKeywords, matchesCuisines } from '@/lib/decide/cuisine'
import { dedupeById, haversineKm, sampleAlongRoute } from '@/lib/decide/geo'
import { pickRestaurant } from '@/lib/decide/pick'
import { rankByDetour } from '@/lib/decide/on-route'

export interface NearbyCandidate {
  restaurant: Restaurant
  distanceKm: number
}

export interface NearbyWheel {
  candidates: NearbyCandidate[]
}

export interface OnRouteCandidate {
  restaurant: Restaurant
  detourKm: number
}

export interface OnRouteWheel {
  candidates: OnRouteCandidate[]
  baseDistanceKm: number
  baseDurationMin: number
}

const NEARBY_SEARCH_LIMIT = 30
const CORRIDOR_SEARCH_LIMIT = 15
const ROUTE_SAMPLE_POINTS = 4
const ON_ROUTE_SHORTLIST = 14
/** How many slices the spin wheel can hold. */
const WHEEL_SIZE = 8
/** Below this, a cuisine filter is treated as too strict and ignored. */
const MIN_CUISINE_MATCHES = 3

/** Run one provider search per keyword around a point and merge/dedupe results. */
async function gatherCandidates(
  provider: PlacesProvider,
  center: LatLng,
  keywords: readonly string[],
  limit: number,
): Promise<Restaurant[]> {
  const batches = await Promise.all(
    keywords.map((keyword) => provider.searchFood({ center, keyword, limit })),
  )
  return dedupeById(batches.flat())
}

/** Per-request cuisine choice overrides the stored cuisine preference. */
function withCuisines(prefs: Preferences, cuisines: readonly string[]): Preferences {
  const chosen = cuisines.map((c) => c.trim()).filter((c) => c.length > 0)
  return chosen.length > 0 ? { ...prefs, cuisines: chosen } : prefs
}

/** Keep only places matching the chosen cuisines; fall back to all if too few. */
function applyCuisineFilter<T extends Restaurant>(
  pool: readonly T[],
  cuisines: readonly string[],
): T[] {
  const chosen = cuisines.map((c) => c.trim()).filter((c) => c.length > 0)
  if (chosen.length === 0) return [...pool]
  const matched = pool.filter((restaurant) => matchesCuisines(restaurant, chosen))
  return matched.length >= MIN_CUISINE_MATCHES ? matched : [...pool]
}

/** Weighted random sample (no repeats) of up to `size` distinct restaurants. */
function sampleWheel<T extends Restaurant>(
  pool: readonly T[],
  prefs: Preferences,
  size: number,
  excludeIds: readonly string[] = [],
): T[] {
  const picked: T[] = []
  const excluded = [...excludeIds]
  for (let i = 0; i < size; i++) {
    const restaurant = pickRestaurant(pool, prefs, { excludeIds: excluded })
    if (!restaurant) break
    picked.push(restaurant)
    excluded.push(restaurant.id)
  }
  return picked
}

/** Scenario 1 — "just eat": gather a wheel of places within `radiusKm` of `center`. */
export async function nearbyWheel(
  provider: PlacesProvider,
  prefs: Preferences,
  center: LatLng,
  radiusKm: number,
  cuisines: readonly string[] = [],
  excludeIds: readonly string[] = [],
): Promise<NearbyWheel> {
  const effective = withCuisines(prefs, cuisines)
  const keywords = deriveSearchKeywords(effective)
  const candidates = await gatherCandidates(provider, center, keywords, NEARBY_SEARCH_LIMIT)

  const withinRadius = candidates.filter((r) => haversineKm(center, r.location) <= radiusKm)
  // Fall back to all candidates when nothing falls inside the radius.
  const pool = withinRadius.length > 0 ? withinRadius : candidates
  const filtered = applyCuisineFilter(pool, cuisines)

  const winners = sampleWheel(filtered, effective, WHEEL_SIZE, excludeIds)
  return {
    candidates: winners.map((restaurant) => ({
      restaurant,
      distanceKm: haversineKm(center, restaurant.location),
    })),
  }
}

/** Scenario 2 — "eat then go": gather a wheel of the most on-the-way places. */
export async function onRouteWheel(
  provider: PlacesProvider,
  prefs: Preferences,
  origin: LatLng,
  destination: LatLng,
  cuisines: readonly string[] = [],
  excludeIds: readonly string[] = [],
): Promise<OnRouteWheel> {
  const route = await provider.calculateRoute({ origin, destination })
  const corridor =
    route.geometry.length > 0
      ? sampleAlongRoute(route.geometry, ROUTE_SAMPLE_POINTS)
      : [origin, destination]
  const effective = withCuisines(prefs, cuisines)
  const keywords = deriveSearchKeywords(effective)

  const batches = await Promise.all(
    corridor.map((point) => gatherCandidates(provider, point, keywords, CORRIDOR_SEARCH_LIMIT)),
  )
  const candidates = dedupeById(batches.flat())

  const ranked = rankByDetour(candidates, origin, destination, route.distanceKm)
  const shortlist = applyCuisineFilter(ranked, cuisines).slice(0, ON_ROUTE_SHORTLIST)

  const winners = sampleWheel(shortlist, effective, WHEEL_SIZE, excludeIds)
  return {
    candidates: winners.map((restaurant) => ({ restaurant, detourKm: restaurant.detourKm })),
    baseDistanceKm: route.distanceKm,
    baseDurationMin: route.durationMin,
  }
}
