'use client'

import type { DecideResult } from '@/lib/client/types'
import {
  estimateTripMinutes,
  formatKm,
  formatMinutes,
  mapsDirectionsUrl,
  mapsSearchUrl,
} from '@/lib/client/format'
import { RouteSketch } from '@/components/RouteSketch'

interface ResultCardProps {
  result: DecideResult
  rerolling?: boolean
  onReroll: () => void
  onBack: () => void
}

function onRouteMetric(detourKm: number, baseDistanceKm: number, baseDurationMin: number): string {
  const tripMin = estimateTripMinutes(baseDurationMin, baseDistanceKm, detourKm)
  const detour = detourKm < 0.2 ? '几乎不绕路' : `顺路多绕 ${formatKm(detourKm)}`
  return `${detour} · 全程开车约 ${formatMinutes(tripMin)} 🚗`
}

export function ResultCard({ result, rerolling = false, onReroll, onBack }: ResultCardProps) {
  const { restaurant } = result

  return (
    <div className="pop sticker tilt-l mt-6 p-5">
      <p className="text-xl text-ink-soft">🎉 就吃这家！</p>
      <h2 className="mt-1 text-[2.3rem] leading-[1.1] text-ink">{restaurant.name}</h2>

      {(restaurant.cuisines.length > 0 || restaurant.openNow !== undefined) && (
        <p className="mt-2 text-lg text-ink-soft">
          {restaurant.cuisines.slice(0, 3).join(' · ')}
          {restaurant.openNow === true && (
            <span className="text-mint">{restaurant.cuisines.length ? ' · 还开着 ✅' : '还开着 ✅'}</span>
          )}
          {restaurant.openNow === false && (
            <span className="text-tomato">{restaurant.cuisines.length ? ' · 可能打烊了 😴' : '可能打烊了 😴'}</span>
          )}
        </p>
      )}

      {result.mode === 'nearby' ? (
        <>
          <p className="mt-3 text-xl text-ink">离你大概 {formatKm(result.distanceKm)} 🚶</p>
          {restaurant.address && (
            <p className="mt-1 text-base leading-relaxed text-ink-soft">{restaurant.address}</p>
          )}
          <a
            href={mapsSearchUrl(restaurant.location)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-pop mt-5 flex min-h-13 w-full items-center justify-center px-4 text-2xl text-ink"
            style={{ background: 'var(--color-sun)' }}
          >
            📍 带我去！
          </a>
        </>
      ) : (
        <>
          <p className="mt-3 text-lg text-ink">
            {onRouteMetric(result.detourKm, result.baseDistanceKm, result.baseDurationMin)}
          </p>
          {restaurant.address && (
            <p className="mt-1 text-base leading-relaxed text-ink-soft">{restaurant.address}</p>
          )}

          <div className="mt-4">
            <RouteSketch
              origin={result.origin}
              restaurant={restaurant.location}
              destination={result.destination}
              restaurantName={restaurant.name}
            />
          </div>

          <div className="mt-4 flex gap-3">
            <a
              href={mapsDirectionsUrl(result.origin, restaurant.location)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-pop flex min-h-13 flex-1 items-center justify-center px-3 text-lg text-ink"
              style={{ background: '#fffdf6' }}
            >
              🍽️ 只去餐厅
            </a>
            <a
              href={mapsDirectionsUrl(result.origin, result.destination, restaurant.location)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-pop flex min-h-13 flex-1 items-center justify-center px-3 text-lg text-ink"
              style={{ background: 'var(--color-sun)' }}
            >
              🚗 顺路全程
            </a>
          </div>
        </>
      )}

      <div className="mt-3 flex gap-3">
        <button
          type="button"
          onClick={onReroll}
          disabled={rerolling}
          className="btn-pop min-h-12 flex-1 px-3 text-lg text-ink"
          style={{ background: 'var(--color-bubble)' }}
        >
          {rerolling ? '换…' : '🎲 换一批'}
        </button>
        <button
          type="button"
          onClick={onBack}
          className="btn-pop min-h-12 flex-1 px-3 text-lg text-ink"
          style={{ background: '#fffdf6' }}
        >
          ← 重选
        </button>
      </div>
    </div>
  )
}
