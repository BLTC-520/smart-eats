import { describe, expect, it } from 'vitest'
import { isOpenNow } from '@/lib/grab/opening-hours'

const WEEK = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

/** Same hours every day, so tests don't depend on the weekday. */
function everyDay(ranges: [string, string][]): string {
  return JSON.stringify(Object.fromEntries(WEEK.map((day) => [day, ranges])))
}

describe('isOpenNow', () => {
  it('returns undefined for missing, empty, or invalid hours', () => {
    expect(isOpenNow(undefined)).toBeUndefined()
    expect(isOpenNow('{}')).toBeUndefined()
    expect(isOpenNow('not json')).toBeUndefined()
  })

  it('is open inside a daytime range (converted to KL time)', () => {
    // 04:00Z == 12:00 in KL (UTC+8)
    expect(isOpenNow(everyDay([['09:00', '22:00']]), new Date('2026-06-29T04:00:00Z'))).toBe(true)
  })

  it('is closed outside the range', () => {
    // 16:00Z == 00:00 next day KL
    expect(isOpenNow(everyDay([['09:00', '22:00']]), new Date('2026-06-29T16:00:00Z'))).toBe(false)
  })

  it('handles overnight ranges', () => {
    // 17:00Z == 01:00 KL, inside an 18:00–02:00 window
    expect(isOpenNow(everyDay([['18:00', '02:00']]), new Date('2026-06-28T17:00:00Z'))).toBe(true)
  })
})
