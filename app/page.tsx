'use client'

import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import Link from 'next/link'
import { ModeToggle } from '@/components/ModeToggle'
import { RadiusSlider } from '@/components/RadiusSlider'
import { PlacePicker, type PlaceValue } from '@/components/PlacePicker'
import { CuisinePicker } from '@/components/CuisinePicker'
import { SpinWheel } from '@/components/SpinWheel'
import { ResultCard } from '@/components/ResultCard'
import { KL_CENTER } from '@/lib/kl'
import { getErrorMessage } from '@/lib/errors'
import type {
  ApiResponse,
  DecideMode,
  DecideResult,
  NearbyWheel,
  OnRouteWheel,
} from '@/lib/client/types'
import type { Preferences } from '@/lib/prefs/schema'

const DEFAULT_PLACE: PlaceValue = { label: 'KLCC', center: KL_CENTER }

type Wheel =
  | ({ mode: 'nearby' } & NearbyWheel)
  | ({ mode: 'onroute' } & OnRouteWheel)

/** Stagger delay for the bouncy page-load reveal. */
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

function toResult(wheel: Wheel, index: number): DecideResult {
  if (wheel.mode === 'nearby') {
    const candidate = wheel.candidates[index]
    return { mode: 'nearby', restaurant: candidate.restaurant, distanceKm: candidate.distanceKm }
  }
  const candidate = wheel.candidates[index]
  return {
    mode: 'onroute',
    restaurant: candidate.restaurant,
    detourKm: candidate.detourKm,
    baseDistanceKm: wheel.baseDistanceKm,
    baseDurationMin: wheel.baseDurationMin,
  }
}

export default function HomePage() {
  const [mode, setMode] = useState<DecideMode>('nearby')
  const [nearby, setNearby] = useState<PlaceValue>(DEFAULT_PLACE)
  const [radiusKm, setRadiusKm] = useState(3)
  const [origin, setOrigin] = useState<PlaceValue>(DEFAULT_PLACE)
  const [destination, setDestination] = useState<PlaceValue | null>(null)
  const [cuisines, setCuisines] = useState<string[]>([])

  const [wheel, setWheel] = useState<Wheel | null>(null)
  const [result, setResult] = useState<DecideResult | null>(null)
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

  async function fetchWheel(excludeIds: string[]): Promise<Wheel> {
    if (mode === 'nearby') {
      const data = await postJson<NearbyWheel>('/api/decide', {
        center: nearby.center,
        radiusKm,
        cuisines,
        excludeIds,
      })
      return { mode: 'nearby', ...data }
    }
    if (!destination) throw new Error('先选你接下来要去的地方')
    const data = await postJson<OnRouteWheel>('/api/decide-onroute', {
      origin: origin.center,
      destination: destination.center,
      cuisines,
      excludeIds,
    })
    return { mode: 'onroute', ...data }
  }

  async function loadWheel(excludeIds: string[], fresh: boolean): Promise<void> {
    if (mode === 'onroute' && !destination) {
      setError('先选你接下来要去的地方')
      return
    }
    setError(null)
    if (fresh) setLoading(true)
    else setRerolling(true)
    try {
      const next = await fetchWheel(excludeIds)
      setWheel(next)
      setResult(null)
    } catch (cause) {
      setError(getErrorMessage(cause))
    } finally {
      setLoading(false)
      setRerolling(false)
    }
  }

  function backToSetup(): void {
    setWheel(null)
    setResult(null)
    setError(null)
  }

  return (
    <main className="safe-px safe-pt safe-pb mx-auto flex min-h-dvh w-full max-w-md flex-col overflow-x-hidden">
      <header className="flex items-center justify-between py-3">
        <span className="wiggle inline-block text-3xl text-ink">万选食堂</span>
        {wheel ? (
          <button type="button" onClick={backToSetup} className="text-xl text-ink-soft hover:text-ink">
            ← 重选
          </button>
        ) : (
          <Link href="/preferences" className="text-xl text-ink-soft hover:text-ink">
            口味 ⚙️
          </Link>
        )}
      </header>

      {!wheel ? (
        <section className="flex flex-1 flex-col">
          <h1 className="pop mt-6 text-[2.7rem] leading-[1.05] text-ink" style={delay(40)}>
            今天吃啥？<span className="inline-block tilt-r">🍜</span>
          </h1>
          <p className="pop mt-2 text-xl text-ink-soft" style={delay(100)}>
            选个菜系，转个盘，不用再纠结啦～
          </p>

          <div className="pop mt-7" style={delay(160)}>
            <ModeToggle value={mode} onChange={setMode} />
          </div>

          <div className="pop mt-7 space-y-6" style={delay(240)}>
            {mode === 'nearby' ? (
              <>
                <PlacePicker title="在哪一带？📍" value={nearby} onChange={setNearby} />
                <RadiusSlider value={radiusKm} onChange={setRadiusKm} />
              </>
            ) : (
              <>
                <PlacePicker title="现在人在？📍" value={origin} onChange={setOrigin} />
                <PlacePicker title="待会要去？🚩" value={destination} onChange={setDestination} allowGps={false} />
              </>
            )}
            <CuisinePicker selected={cuisines} onChange={setCuisines} />
          </div>

          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-9">
            <button
              type="button"
              onClick={() => loadWheel([], true)}
              disabled={loading}
              className="btn-pop bob min-h-16 w-full px-6 text-3xl text-ink"
              style={{ background: 'var(--color-tomato)' }}
            >
              {loading ? '找店中…🔎' : '🎡 去转盘！'}
            </button>
            {error && <p className="px-4 text-center text-lg text-tomato">{error}</p>}
          </div>
        </section>
      ) : (
        <section className="flex flex-1 flex-col pt-3">
          <p className="text-center text-xl text-ink-soft">
            转出 {wheel.candidates.length} 家 · 戳中间转一转 👇
          </p>
          <div className="mt-5">
            <SpinWheel
              key={wheel.candidates.map((c) => c.restaurant.id).join(',')}
              items={wheel.candidates.map((c) => ({ id: c.restaurant.id, label: c.restaurant.name }))}
              onSpinStart={() => setResult(null)}
              onResult={(index) => setResult(toResult(wheel, index))}
            />
          </div>

          {result && (
            <ResultCard
              result={result}
              rerolling={rerolling}
              onReroll={() => loadWheel(wheel.candidates.map((c) => c.restaurant.id), false)}
              onBack={backToSetup}
            />
          )}
          {error && <p className="px-4 pt-4 text-center text-lg text-tomato">{error}</p>}
        </section>
      )}

      <p className="pt-3 text-center text-base text-ink-soft/70">GrabMaps · 吉隆坡</p>
    </main>
  )
}
