import { z } from 'zod'
import type { LatLng, Place, Restaurant, RouteResult } from '@/lib/grab/provider'
import { isOpenNow } from '@/lib/grab/opening-hours'
import { decodePolyline6 } from '@/lib/decide/geo'

const FOOD_PREFIX = 'food and beverage'

const grabLocationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
})

const grabPlaceSchema = z.object({
  poi_id: z.string(),
  name: z.string(),
  location: grabLocationSchema,
  formatted_address: z.string().optional(),
  business_type: z.string().optional(),
  category: z.string().optional(),
  categories: z.array(z.object({ category_name: z.string() })).optional(),
  opening_hours: z.string().optional(),
})

type GrabPlace = z.infer<typeof grabPlaceSchema>

const grabSearchResponseSchema = z.object({
  places: z.array(z.unknown()).optional(),
})

const grabRouteResponseSchema = z.object({
  routes: z
    .array(
      z.object({
        distance: z.number(),
        duration: z.number(),
        geometry: z.string().optional(),
      }),
    )
    .min(1),
})

function isFood(place: GrabPlace): boolean {
  if (place.business_type?.toLowerCase().includes(FOOD_PREFIX)) return true
  if (place.category?.toLowerCase().startsWith(FOOD_PREFIX)) return true
  return place.categories?.some((c) => c.category_name.toLowerCase().startsWith(FOOD_PREFIX)) ?? false
}

function parseCuisines(place: GrabPlace): string[] {
  const tags = new Set<string>()
  const addFrom = (category: string): void => {
    category
      .split('::')
      .map((part) => part.trim())
      .filter((part) => part.length > 0 && part.toLowerCase() !== FOOD_PREFIX)
      .forEach((part) => tags.add(part))
  }
  if (place.category) addFrom(place.category)
  place.categories?.forEach((c) => addFrom(c.category_name))
  return [...tags]
}

/** Map a raw Grab search/nearby response into food Restaurants (skips non-food/invalid). */
export function mapSearchResponse(raw: unknown, now: Date = new Date()): Restaurant[] {
  const response = grabSearchResponseSchema.safeParse(raw)
  if (!response.success || !response.data.places) return []

  const restaurants: Restaurant[] = []
  for (const candidate of response.data.places) {
    const place = grabPlaceSchema.safeParse(candidate)
    if (!place.success || !isFood(place.data)) continue
    restaurants.push({
      id: place.data.poi_id,
      name: place.data.name,
      location: { lat: place.data.location.latitude, lng: place.data.location.longitude },
      address: place.data.formatted_address,
      category: place.data.category,
      cuisines: parseCuisines(place.data),
      openNow: isOpenNow(place.data.opening_hours, now),
    })
  }
  return restaurants
}

/** Map a raw Grab search response into Places of any kind (parks, malls, …). */
export function mapPlacesResponse(raw: unknown): Place[] {
  const response = grabSearchResponseSchema.safeParse(raw)
  if (!response.success || !response.data.places) return []

  const places: Place[] = []
  const seen = new Set<string>()
  for (const candidate of response.data.places) {
    const place = grabPlaceSchema.safeParse(candidate)
    if (!place.success || seen.has(place.data.poi_id)) continue
    seen.add(place.data.poi_id)
    places.push({
      id: place.data.poi_id,
      name: place.data.name,
      location: { lat: place.data.location.latitude, lng: place.data.location.longitude },
      address: place.data.formatted_address,
    })
  }
  return places
}

/** Map a raw Grab direction response into a normalized RouteResult. */
export function mapRouteResponse(raw: unknown): RouteResult {
  const parsed = grabRouteResponseSchema.parse(raw)
  const route = parsed.routes[0]
  const geometry: LatLng[] = route.geometry ? decodePolyline6(route.geometry) : []
  return {
    distanceKm: route.distance / 1000,
    durationMin: route.duration / 60,
    geometry,
  }
}
