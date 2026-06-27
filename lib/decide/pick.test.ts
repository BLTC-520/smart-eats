import { describe, expect, it } from 'vitest'
import { filterCandidates, pickRestaurant } from '@/lib/decide/pick'
import { defaultPreferences, type Preferences } from '@/lib/prefs/schema'
import { makeRestaurant } from '@/lib/decide/test-helpers'

function prefs(overrides: Partial<Preferences> = {}): Preferences {
  return { ...defaultPreferences, ...overrides }
}

describe('filterCandidates', () => {
  it('drops excluded ids', () => {
    const list = [makeRestaurant({ id: 'a' }), makeRestaurant({ id: 'b' })]
    expect(filterCandidates(list, prefs(), ['a']).map((r) => r.id)).toEqual(['b'])
  })

  it('drops disliked restaurants', () => {
    const list = [
      makeRestaurant({ id: 'a', name: 'Cucumber Bar' }),
      makeRestaurant({ id: 'b', name: 'Noodle House' }),
    ]
    expect(filterCandidates(list, prefs({ dislikes: ['cucumber'] }), []).map((r) => r.id)).toEqual([
      'b',
    ])
  })

  it('drops closed places only when onlyOpenNow is set', () => {
    const list = [
      makeRestaurant({ id: 'open', openNow: true }),
      makeRestaurant({ id: 'closed', openNow: false }),
      makeRestaurant({ id: 'unknown' }),
    ]
    expect(filterCandidates(list, prefs({ onlyOpenNow: true }), []).map((r) => r.id)).toEqual([
      'open',
      'unknown',
    ])
  })
})

describe('pickRestaurant', () => {
  it('returns null when nothing qualifies', () => {
    expect(pickRestaurant([], prefs())).toBeNull()
  })

  it('is deterministic with an injected RNG', () => {
    const list = [makeRestaurant({ id: 'a' }), makeRestaurant({ id: 'b' })]
    expect(pickRestaurant(list, prefs(), { random: () => 0 })?.id).toBe('a')
    expect(pickRestaurant(list, prefs(), { random: () => 0.99 })?.id).toBe('b')
  })

  it('never picks an excluded restaurant', () => {
    const list = [makeRestaurant({ id: 'a' }), makeRestaurant({ id: 'b' })]
    expect(pickRestaurant(list, prefs(), { excludeIds: ['a'], random: () => 0 })?.id).toBe('b')
  })
})
