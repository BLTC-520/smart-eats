import type { ApiResponse } from '@/lib/api'
import type { NearbyWheel, OnRouteWheel } from '@/lib/decide/decide-service'
import type { Restaurant } from '@/lib/grab/provider'

export type DecideMode = 'nearby' | 'onroute'

/** The restaurant the wheel landed on, plus the metrics for its result card. */
export type DecideResult =
  | { mode: 'nearby'; restaurant: Restaurant; distanceKm: number }
  | {
      mode: 'onroute'
      restaurant: Restaurant
      detourKm: number
      baseDistanceKm: number
      baseDurationMin: number
    }

export type { ApiResponse, NearbyWheel, OnRouteWheel, Restaurant }
