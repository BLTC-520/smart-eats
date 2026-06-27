import { describe, expect, it } from 'vitest'
import { dedupeById, decodePolyline6, haversineKm, sampleAlongRoute } from '@/lib/decide/geo'

/** Independent polyline6 encoder, to verify the decoder by round-trip. */
function encodePolyline6(coords: [number, number][]): string {
  let lastLat = 0
  let lastLng = 0
  let output = ''
  const encode = (current: number, previous: number): string => {
    let value = Math.round(current * 1e6) - Math.round(previous * 1e6)
    value = value < 0 ? ~(value << 1) : value << 1
    let chunk = ''
    while (value >= 0x20) {
      chunk += String.fromCharCode((0x20 | (value & 0x1f)) + 63)
      value >>= 5
    }
    chunk += String.fromCharCode(value + 63)
    return chunk
  }
  for (const [lat, lng] of coords) {
    output += encode(lat, lastLat) + encode(lng, lastLng)
    lastLat = lat
    lastLng = lng
  }
  return output
}

describe('haversineKm', () => {
  it('is zero for identical points', () => {
    expect(haversineKm({ lat: 3.15, lng: 101.7 }, { lat: 3.15, lng: 101.7 })).toBe(0)
  })

  it('matches the known ~111 km per degree of longitude at the equator', () => {
    expect(haversineKm({ lat: 0, lng: 0 }, { lat: 0, lng: 1 })).toBeCloseTo(111.19, 1)
  })
})

describe('dedupeById', () => {
  it('keeps the first occurrence of each id', () => {
    const result = dedupeById([
      { id: 'a', n: 1 },
      { id: 'b', n: 2 },
      { id: 'a', n: 3 },
    ])
    expect(result).toEqual([
      { id: 'a', n: 1 },
      { id: 'b', n: 2 },
    ])
  })
})

describe('sampleAlongRoute', () => {
  const geometry = Array.from({ length: 11 }, (_, i) => ({ lat: i, lng: i }))

  it('includes both endpoints', () => {
    const sampled = sampleAlongRoute(geometry, 4)
    expect(sampled[0]).toEqual({ lat: 0, lng: 0 })
    expect(sampled.at(-1)).toEqual({ lat: 10, lng: 10 })
    expect(sampled.length).toBe(4)
  })

  it('returns the whole geometry when fewer points than requested', () => {
    const short = [{ lat: 1, lng: 1 }, { lat: 2, lng: 2 }]
    expect(sampleAlongRoute(short, 5)).toEqual(short)
  })

  it('returns nothing for non-positive counts', () => {
    expect(sampleAlongRoute(geometry, 0)).toEqual([])
  })
})

describe('decodePolyline6', () => {
  it('round-trips coordinates at precision 6', () => {
    const original: [number, number][] = [
      [3.1578, 101.7117],
      [3.118, 101.677],
    ]
    const decoded = decodePolyline6(encodePolyline6(original))
    expect(decoded).toHaveLength(2)
    expect(decoded[0].lat).toBeCloseTo(3.1578, 5)
    expect(decoded[0].lng).toBeCloseTo(101.7117, 5)
    expect(decoded[1].lat).toBeCloseTo(3.118, 5)
    expect(decoded[1].lng).toBeCloseTo(101.677, 5)
  })
})
