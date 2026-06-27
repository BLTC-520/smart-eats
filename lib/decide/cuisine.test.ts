import { describe, expect, it } from 'vitest'
import { deriveSearchKeywords, isDisliked, likeWeight } from '@/lib/decide/cuisine'
import { makeRestaurant } from '@/lib/decide/test-helpers'

describe('deriveSearchKeywords', () => {
  it('falls back to "restaurant" when no cuisines are set', () => {
    expect(deriveSearchKeywords({ cuisines: [] })).toEqual(['restaurant'])
  })

  it('uses preferred cuisines, trimming blanks', () => {
    expect(deriveSearchKeywords({ cuisines: ['chinese', ' '] })).toEqual(['chinese'])
  })
})

describe('isDisliked', () => {
  it('matches against name (case-insensitive)', () => {
    const restaurant = makeRestaurant({ name: 'Cucumber Cafe' })
    expect(isDisliked(restaurant, { dislikes: ['cucumber'] })).toBe(true)
  })

  it('matches against category and cuisines', () => {
    const restaurant = makeRestaurant({ category: 'food and beverage::indian', cuisines: ['indian'] })
    expect(isDisliked(restaurant, { dislikes: ['indian'] })).toBe(true)
  })

  it('returns false when there are no dislikes', () => {
    expect(isDisliked(makeRestaurant(), { dislikes: [] })).toBe(false)
  })
})

describe('likeWeight', () => {
  it('boosts restaurants that match a liked keyword', () => {
    const restaurant = makeRestaurant({ name: 'Eggplant House' })
    expect(likeWeight(restaurant, { likes: ['eggplant'] })).toBeGreaterThan(
      likeWeight(restaurant, { likes: [] }),
    )
  })
})
