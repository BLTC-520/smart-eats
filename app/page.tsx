'use client'

import { useEffect, useState } from 'react'
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

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const json = (await response.json()) as ApiResponse<T>
  if (!json.success || json.data === undefined) {
    throw new Error(json.error ?? '出错了，请再试一次')
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

  return (
    <main className="safe-px safe-pt safe-pb mx-auto flex min-h-dvh max-w-md flex-col">
      <header className="flex items-center justify-between py-2">
        <h1 className="text-lg font-bold text-white">万选吃饭</h1>
        <Link
          href="/preferences"
          className="flex min-h-9 items-center rounded-full bg-white/10 px-3 text-sm text-slate-200"
        >
          ⚙️ 偏好
        </Link>
      </header>

      <ModeToggle value={mode} onChange={setMode} />

      <section className="mt-4 space-y-3">
        {mode === 'nearby' ? (
          <>
            <PlacePicker title="在哪一带吃" value={nearby} onChange={setNearby} />
            <div className="rounded-2xl bg-white/5 p-3">
              <RadiusSlider value={radiusKm} onChange={setRadiusKm} />
            </div>
          </>
        ) : (
          <>
            <PlacePicker title="吃饭起点" value={origin} onChange={setOrigin} />
            <PlacePicker
              title="接下来要去"
              value={destination}
              onChange={setDestination}
              allowGps={false}
            />
          </>
        )}
      </section>

      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-8">
        <DecideButton loading={loading} onClick={() => decide(true)} />
        <p className="min-h-5 px-4 text-center text-sm text-rose-400">{error}</p>
      </div>

      <p className="pb-2 text-center text-xs text-slate-500">数据来自 GrabMaps · 吉隆坡</p>

      {result && (
        <div
          className="safe-px safe-pb fixed inset-0 z-20 flex items-end bg-black/60"
          onClick={() => setResult(null)}
        >
          <div className="w-full" onClick={(event) => event.stopPropagation()}>
            <ResultCard
              result={result}
              rerolling={rerolling}
              onReroll={() => decide(false)}
              onClose={() => setResult(null)}
            />
          </div>
        </div>
      )}
    </main>
  )
}
