import type { ApiResponse } from '@/lib/api'
import type { NearbyDecision, OnRouteDecision } from '@/lib/decide/decide-service'

export type DecideMode = 'nearby' | 'onroute'

/** A decision plus the mode it came from, for rendering the result card. */
export type DecideResult =
  | ({ mode: 'nearby' } & NearbyDecision)
  | ({ mode: 'onroute' } & OnRouteDecision)

export type { ApiResponse, NearbyDecision, OnRouteDecision }
