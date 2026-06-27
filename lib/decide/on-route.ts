import type { LatLng, Restaurant } from '@/lib/grab/provider'
import { haversineKm } from '@/lib/decide/geo'

export interface RankedRestaurant extends Restaurant {
  /** Extra distance (km) versus the direct route, when stopping here. */
  detourKm: number
}

/** Rank restaurants by how little they add to a direct origin→destination trip. */
export function rankByDetour(
  candidates: readonly Restaurant[],
  origin: LatLng,
  destination: LatLng,
  baseDistanceKm: number,
): RankedRestaurant[] {
  return candidates
    .map((restaurant) => {
      const viaKm =
        haversineKm(origin, restaurant.location) + haversineKm(restaurant.location, destination)
      const detourKm = Math.max(0, viaKm - baseDistanceKm)
      return { ...restaurant, detourKm }
    })
    .sort((a, b) => a.detourKm - b.detourKm)
}
