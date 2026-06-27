import type {
  PlacesProvider,
  Restaurant,
  RouteParams,
  RouteResult,
  SearchFoodParams,
} from '@/lib/grab/provider'
import { grabGet } from '@/lib/grab/client'
import { mapRouteResponse, mapSearchResponse } from '@/lib/grab/mappers'

const COUNTRY = 'MYS'
const DEFAULT_LIMIT = 30
const DEFAULT_KEYWORD = 'restaurant'

/** GrabMaps-backed implementation of the PlacesProvider abstraction. */
export class GrabMapsProvider implements PlacesProvider {
  async searchFood(params: SearchFoodParams): Promise<Restaurant[]> {
    const { center, keyword = DEFAULT_KEYWORD, limit = DEFAULT_LIMIT } = params
    const raw = await grabGet('/maps/poi/v1/search', {
      keyword,
      country: COUNTRY,
      location: `${center.lat},${center.lng}`,
      limit,
    })
    return mapSearchResponse(raw)
  }

  async calculateRoute(params: RouteParams): Promise<RouteResult> {
    const { origin, destination } = params
    const raw = await grabGet('/maps/eta/v1/direction', {
      // Grab expects coordinates as lng,lat pairs.
      coordinates: [`${origin.lng},${origin.lat}`, `${destination.lng},${destination.lat}`],
      profile: 'driving',
      overview: 'full',
    })
    return mapRouteResponse(raw)
  }
}

let singleton: GrabMapsProvider | null = null

export function getPlacesProvider(): PlacesProvider {
  if (!singleton) singleton = new GrabMapsProvider()
  return singleton
}
