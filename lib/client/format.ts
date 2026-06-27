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
