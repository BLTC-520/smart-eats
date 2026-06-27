import { describe, expect, it } from 'vitest'
import { rankByDetour } from '@/lib/decide/on-route'
import { haversineKm } from '@/lib/decide/geo'
import { makeRestaurant } from '@/lib/decide/test-helpers'

const origin = { lat: 3.0, lng: 101.0 }
const destination = { lat: 3.0, lng: 101.2 }

describe('rankByDetour', () => {
  const baseKm = haversineKm(origin, destination)

  it('gives ~zero detour to a restaurant directly on the path', () => {
    const onPath = makeRestaurant({ id: 'on', location: { lat: 3.0, lng: 101.1 } })
    const [ranked] = rankByDetour([onPath], origin, destination, baseKm)
    expect(ranked.detourKm).toBeCloseTo(0, 3)
  })

  it('sorts by ascending detour', () => {
    const onPath = makeRestaurant({ id: 'on', location: { lat: 3.0, lng: 101.1 } })
    const offPath = makeRestaurant({ id: 'off', location: { lat: 3.1, lng: 101.1 } })
    const ranked = rankByDetour([offPath, onPath], origin, destination, baseKm)
    expect(ranked.map((r) => r.id)).toEqual(['on', 'off'])
    expect(ranked[1].detourKm).toBeGreaterThan(ranked[0].detourKm)
  })
})
