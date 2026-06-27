import type { LatLng, PlacesProvider, Restaurant } from '@/lib/grab/provider'
import type { Preferences } from '@/lib/prefs/schema'
import { deriveSearchKeywords } from '@/lib/decide/cuisine'
import { dedupeById, haversineKm, sampleAlongRoute } from '@/lib/decide/geo'
import { pickRestaurant } from '@/lib/decide/pick'
import { rankByDetour } from '@/lib/decide/on-route'

export interface NearbyDecision {
  restaurant: Restaurant
  distanceKm: number
}

export interface OnRouteDecision {
  restaurant: Restaurant
  detourKm: number
  baseDistanceKm: number
  baseDurationMin: number
}

const NEARBY_SEARCH_LIMIT = 30
const CORRIDOR_SEARCH_LIMIT = 15
const ROUTE_SAMPLE_POINTS = 4
const ON_ROUTE_SHORTLIST = 8

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

/** Scenario 1 — "just eat": pick a restaurant within `radiusKm` of `center`. */
export async function decideNearby(
  provider: PlacesProvider,
  prefs: Preferences,
  center: LatLng,
  radiusKm: number,
  excludeIds: readonly string[] = [],
): Promise<NearbyDecision | null> {
  const keywords = deriveSearchKeywords(prefs)
  const candidates = await gatherCandidates(provider, center, keywords, NEARBY_SEARCH_LIMIT)

  const withinRadius = candidates.filter((r) => haversineKm(center, r.location) <= radiusKm)
  // Fall back to all candidates when nothing falls inside the radius.
  const pool = withinRadius.length > 0 ? withinRadius : candidates

  const restaurant = pickRestaurant(pool, prefs, { excludeIds })
  if (!restaurant) return null
  return { restaurant, distanceKm: haversineKm(center, restaurant.location) }
}

/** Scenario 2 — "eat then go": pick the most on-the-way restaurant. */
export async function decideOnRoute(
  provider: PlacesProvider,
  prefs: Preferences,
  origin: LatLng,
  destination: LatLng,
  excludeIds: readonly string[] = [],
): Promise<OnRouteDecision | null> {
  const route = await provider.calculateRoute({ origin, destination })
  const corridor =
    route.geometry.length > 0
      ? sampleAlongRoute(route.geometry, ROUTE_SAMPLE_POINTS)
      : [origin, destination]
  const keywords = deriveSearchKeywords(prefs)

  const batches = await Promise.all(
    corridor.map((point) => gatherCandidates(provider, point, keywords, CORRIDOR_SEARCH_LIMIT)),
  )
  const candidates = dedupeById(batches.flat())

  const ranked = rankByDetour(candidates, origin, destination, route.distanceKm)
  const shortlist = ranked.slice(0, ON_ROUTE_SHORTLIST)

  const restaurant = pickRestaurant(shortlist, prefs, { excludeIds })
  if (!restaurant) return null
  return {
    restaurant,
    detourKm: restaurant.detourKm,
    baseDistanceKm: route.distanceKm,
    baseDurationMin: route.durationMin,
  }
}
