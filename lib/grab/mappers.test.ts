import { describe, expect, it } from 'vitest'
import { mapRouteResponse, mapSearchResponse } from '@/lib/grab/mappers'

const NOON_KL = new Date('2026-06-29T04:00:00Z') // 12:00 in KL

const OPEN_HOURS = JSON.stringify({
  sunday: [['09:00', '22:00']],
  monday: [['09:00', '22:00']],
  tuesday: [['09:00', '22:00']],
  wednesday: [['09:00', '22:00']],
  thursday: [['09:00', '22:00']],
  friday: [['09:00', '22:00']],
  saturday: [['09:00', '22:00']],
})

describe('mapSearchResponse', () => {
  it('keeps food places, drops non-food, and parses cuisines + open status', () => {
    const raw = {
      places: [
        {
          poi_id: '1',
          name: 'The Chinese Palace',
          location: { latitude: 3.16, longitude: 101.71 },
          business_type: 'food and beverage',
          category: 'food and beverage::asian',
          opening_hours: OPEN_HOURS,
        },
        {
          poi_id: '2',
          name: 'Chinese Maternity Hospital',
          location: { latitude: 3.16, longitude: 101.72 },
          category: 'healthcare::hospitals',
        },
      ],
    }
    const result = mapSearchResponse(raw, NOON_KL)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('1')
    expect(result[0].location).toEqual({ lat: 3.16, lng: 101.71 })
    expect(result[0].cuisines).toContain('asian')
    expect(result[0].cuisines).not.toContain('food and beverage')
    expect(result[0].openNow).toBe(true)
  })

  it('returns an empty array for malformed input', () => {
    expect(mapSearchResponse(null)).toEqual([])
    expect(mapSearchResponse({})).toEqual([])
  })
})

describe('mapRouteResponse', () => {
  it('converts metres→km and seconds→minutes', () => {
    const route = mapRouteResponse({ routes: [{ distance: 9000, duration: 600 }] })
    expect(route.distanceKm).toBe(9)
    expect(route.durationMin).toBe(10)
    expect(route.geometry).toEqual([])
  })

  it('throws on a response with no routes', () => {
    expect(() => mapRouteResponse({ routes: [] })).toThrow()
  })
})
