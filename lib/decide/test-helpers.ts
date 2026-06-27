import type { Restaurant } from '@/lib/grab/provider'

/** Build a Restaurant with sensible defaults for tests. */
export function makeRestaurant(overrides: Partial<Restaurant> = {}): Restaurant {
  return {
    id: 'r1',
    name: 'Test Place',
    location: { lat: 3.15, lng: 101.7 },
    cuisines: [],
    ...overrides,
  }
}
