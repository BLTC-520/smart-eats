import type { LatLng } from '@/lib/grab/provider'

/** Human-friendly distance: metres under 1 km, otherwise one-decimal km. */
export function formatKm(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${km.toFixed(1)} km`
}

/** Rounded minutes label. */
export function formatMinutes(minutes: number): string {
  return `${Math.round(minutes)} 分钟`
}

/** Google Maps deep link for a coordinate (opens the native app on mobile). */
export function mapsSearchUrl(location: LatLng): string {
  return `https://www.google.com/maps/search/?api=1&query=${location.lat}%2C${location.lng}`
}

/** Google Maps driving directions, optionally via a single waypoint stop. */
export function mapsDirectionsUrl(origin: LatLng, destination: LatLng, waypoint?: LatLng): string {
  const url = new URL('https://www.google.com/maps/dir/')
  url.searchParams.set('api', '1')
  url.searchParams.set('origin', `${origin.lat},${origin.lng}`)
  url.searchParams.set('destination', `${destination.lat},${destination.lng}`)
  if (waypoint) url.searchParams.set('waypoints', `${waypoint.lat},${waypoint.lng}`)
  url.searchParams.set('travelmode', 'driving')
  return url.toString()
}

/** Estimate total drive time (minutes) when adding a detour to a base trip. */
export function estimateTripMinutes(
  baseDurationMin: number,
  baseDistanceKm: number,
  detourKm: number,
): number {
  if (baseDistanceKm <= 0) return baseDurationMin
  return baseDurationMin * ((baseDistanceKm + detourKm) / baseDistanceKm)
}
