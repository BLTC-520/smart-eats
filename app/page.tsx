'use client'

import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import Link from 'next/link'
import { ModeToggle } from '@/components/ModeToggle'
import { RadiusSlider } from '@/components/RadiusSlider'
import { PlacePicker, type PlaceValue } from '@/components/PlacePicker'
import { DecideButton } from '@/components/DecideButton'
import { ResultCard } from '@/components/ResultCard'
import { KL_CENTER } from '@/lib/kl'
import { getErrorMessage } from '@/lib/errors'
import type {
  ApiResponse,
  DecideMode,
  DecideResult,
  NearbyDecision,
  OnRouteDecision,
} from '@/lib/client/types'
import type { Preferences } from '@/lib/prefs/schema'

const DEFAULT_PLACE: PlaceValue = { label: '吉隆坡 (KLCC)', center: KL_CENTER }

/** Stagger delay for the choreographed page-load reveal. */
function delay(ms: number): CSSProperties {
  return { '--d': `${ms}ms` } as CSSProperties
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const json = (await response.json()) as ApiResponse<T>
  if (!json.success || json.data === undefined) {
    throw new Error(json.error ?? '出了点状况，再试一次')
  }
  return json.data
}

export default function HomePage() {
  const [mode, setMode] = useState<DecideMode>('nearby')
  const [nearby, setNearby] = useState<PlaceValue>(DEFAULT_PLACE)
  const [radiusKm, setRadiusKm] = useState(3)
  const [origin, setOrigin] = useState<PlaceValue>(DEFAULT_PLACE)
  const [destination, setDestination] = useState<PlaceValue | null>(null)

  const [result, setResult] = useState<DecideResult | null>(null)
  const [seenIds, setSeenIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [rerolling, setRerolling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/preferences')
      .then((response) => response.json() as Promise<ApiResponse<Preferences>>)
      .then((json) => {
        if (json.success && json.data) setRadiusKm(json.data.defaultRadiusKm)
      })
      .catch(() => undefined)
  }, [])

  async function requestDecision(excludeIds: string[]): Promise<DecideResult> {
    if (mode === 'nearby') {
      const data = await postJson<NearbyDecision>('/api/decide', {
        center: nearby.center,
        radiusKm,
        excludeIds,
      })
      return { mode: 'nearby', ...data }
    }
    if (!destination) throw new Error('先选你接下来要去的目的地')
    const data = await postJson<OnRouteDecision>('/api/decide-onroute', {
      origin: origin.center,
      destination: destination.center,
      excludeIds,
    })
    return { mode: 'onroute', ...data }
  }

  async function decide(fresh: boolean): Promise<void> {
    if (mode === 'onroute' && !destination) {
      setError('先选你接下来要去的目的地')
      return
    }
    setError(null)
    if (fresh) setLoading(true)
    else setRerolling(true)
    try {
      const excludeIds = fresh ? [] : seenIds
      const decision = await requestDecision(excludeIds)
      setResult(decision)
      setSeenIds(fresh ? [decision.restaurant.id] : [...seenIds, decision.restaurant.id])
    } catch (cause) {
      setError(getErrorMessage(cause))
    } finally {
      setLoading(false)
      setRerolling(false)
    }
  }

  function reset(): void {
    setResult(null)
    setSeenIds([])
    setError(null)
  }

  return (
    <main className="safe-px safe-pt safe-pb mx-auto flex min-h-dvh w-full max-w-md flex-col overflow-x-hidden">
      <header className="reveal flex items-center justify-between py-3" style={delay(0)}>
        <span className="font-display text-xl italic text-cream">万选食堂</span>
        <Link
          href="/preferences"
          className="tracking-luxe text-[0.62rem] uppercase text-taupe transition-colors hover:text-gold"
        >
          口味
        </Link>
      </header>
      <div className="rule-gold reveal" style={delay(80)} />

      {!result ? (
        <section className="flex flex-1 flex-col">
          <p className="reveal mt-9 tracking-luxe text-[0.62rem] uppercase text-gold-soft" style={delay(140)}>
            吉隆坡 · 深夜
          </p>
          <h1 className="reveal mt-3 font-serif text-[2.9rem] font-[900] leading-[1.08] text-cream" style={delay(200)}>
            今晚，
            <br />
            吃什么<span className="text-gold">。</span>
          </h1>

          <div className="reveal mt-9" style={delay(280)}>
            <ModeToggle value={mode} onChange={setMode} />
          </div>

          <div className="reveal mt-5 divide-y divide-cream/10" style={delay(360)}>
            {mode === 'nearby' ? (
              <>
                <PlacePicker title="在哪一带" value={nearby} onChange={setNearby} />
                <RadiusSlider value={radiusKm} onChange={setRadiusKm} />
              </>
            ) : (
              <>
                <PlacePicker title="此刻人在" value={origin} onChange={setOrigin} />
                <PlacePicker
                  title="待会要去"
                  value={destination}
                  onChange={setDestination}
                  allowGps={false}
                />
              </>
            )}
          </div>

          <div className="flex flex-1 flex-col items-center justify-center gap-5 py-10">
            <div className="reveal" style={delay(460)}>
              <DecideButton loading={loading} onClick={() => decide(true)} />
            </div>
            <p className="min-h-5 px-6 text-center text-sm text-rose">{error}</p>
          </div>
        </section>
      ) : (
        <section className="flex flex-1 flex-col pt-6">
          <ResultCard
            result={result}
            rerolling={rerolling}
            onReroll={() => decide(false)}
            onBack={reset}
          />
          <p className="min-h-5 px-1 pt-4 text-sm text-rose">{error}</p>
        </section>
      )}

      <p className="tracking-luxe pt-2 text-center text-[0.6rem] uppercase text-taupe/70">
        GrabMaps · Kuala Lumpur
      </p>
    </main>
  )
}
