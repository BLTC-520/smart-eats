import type { LatLng } from '@/lib/grab/provider'

const EARTH_RADIUS_KM = 6371

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

/** Great-circle distance between two coordinates, in kilometres. */
export function haversineKm(a: LatLng, b: LatLng): number {
  const dLat = toRadians(b.lat - a.lat)
  const dLng = toRadians(b.lng - a.lng)
  const lat1 = toRadians(a.lat)
  const lat2 = toRadians(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)))
}

/** Remove duplicate items by `id`, keeping the first occurrence. */
export function dedupeById<T extends { id: string }>(items: readonly T[]): T[] {
  const seen = new Set<string>()
  const result: T[] = []
  for (const item of items) {
    if (seen.has(item.id)) continue
    seen.add(item.id)
    result.push(item)
  }
  return result
}

function dedupePoints(points: readonly LatLng[]): LatLng[] {
  const seen = new Set<string>()
  const result: LatLng[] = []
  for (const point of points) {
    const key = `${point.lat},${point.lng}`
    if (seen.has(key)) continue
    seen.add(key)
    result.push(point)
  }
  return result
}

/** Pick `count` evenly-spaced points from a route geometry (inclusive of ends). */
export function sampleAlongRoute(geometry: readonly LatLng[], count: number): LatLng[] {
  if (count <= 0 || geometry.length === 0) return []
  if (geometry.length <= count) return dedupePoints(geometry)
  if (count === 1) return [geometry[Math.floor(geometry.length / 2)]]
  const step = (geometry.length - 1) / (count - 1)
  const points: LatLng[] = []
  for (let i = 0; i < count; i++) {
    points.push(geometry[Math.round(i * step)])
  }
  return dedupePoints(points)
}

/** Decode an OSRM-style polyline (precision 6, lat/lng order) into coordinates. */
export function decodePolyline6(encoded: string): LatLng[] {
  const factor = 1e6
  const coordinates: LatLng[] = []
  let index = 0
  let lat = 0
  let lng = 0

  const nextDelta = (): number => {
    let result = 0
    let shift = 0
    let byte = 0
    do {
      byte = encoded.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20)
    return result & 1 ? ~(result >> 1) : result >> 1
  }

  while (index < encoded.length) {
    lat += nextDelta()
    lng += nextDelta()
    coordinates.push({ lat: lat / factor, lng: lng / factor })
  }
  return coordinates
}
