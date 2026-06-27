/**
 * Domain types and the provider abstraction for places/routing.
 * GrabMaps is today's implementation; the interface lets us swap it later
 * (Google, OSM, …) without touching UI or decision logic.
 */

/** Geographic coordinate (WGS84). */
export interface LatLng {
  lat: number
  lng: number
}

/** A food place, normalized to our domain from a provider response. */
export interface Restaurant {
  id: string
  name: string
  location: LatLng
  address?: string
  /** Raw provider category, e.g. "food and beverage::chinese::seafood". */
  category?: string
  /** Cuisine tags parsed from the provider category/categories. */
  cuisines: string[]
  /** Open at request time; `undefined` when hours are unknown. */
  openNow?: boolean
}

export interface SearchFoodParams {
  center: LatLng
  keyword?: string
  limit?: number
}

export interface RouteParams {
  origin: LatLng
  destination: LatLng
}

export interface RouteResult {
  distanceKm: number
  durationMin: number
  geometry: LatLng[]
}

/** Abstraction over a maps/places backend. */
export interface PlacesProvider {
  searchFood(params: SearchFoodParams): Promise<Restaurant[]>
  calculateRoute(params: RouteParams): Promise<RouteResult>
}
