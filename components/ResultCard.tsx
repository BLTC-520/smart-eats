'use client'

import type { DecideResult } from '@/lib/client/types'
import { formatKm, formatMinutes, mapsSearchUrl } from '@/lib/client/format'

interface ResultCardProps {
  result: DecideResult
  rerolling?: boolean
  onReroll: () => void
  onBack: () => void
}

function metricLine(result: DecideResult): string {
  if (result.mode === 'nearby') return `距你约 ${formatKm(result.distanceKm)}`
  if (result.detourKm < 0.2) return `几乎不绕路 · 全程约 ${formatMinutes(result.baseDurationMin)}`
  return `顺路只多绕 ${formatKm(result.detourKm)} · 全程约 ${formatMinutes(result.baseDurationMin)}`
}

export function ResultCard({ result, rerolling = false, onReroll, onBack }: ResultCardProps) {
  const { restaurant } = result

  return (
    <div className="reveal flex flex-col">
      <button
        type="button"
        onClick={onBack}
        className="self-start text-sm text-taupe underline decoration-taupe/40 underline-offset-4 hover:text-cream"
      >
        ← 重新决定
      </button>

      <p className="mt-8 tracking-luxe text-[0.62rem] uppercase text-gold-soft">今晚的选择</p>
      <h2 className="mt-3 font-display text-[2.6rem] font-medium italic leading-[1.05] text-cream">
        {restaurant.name}
      </h2>

      {(restaurant.cuisines.length > 0 || restaurant.openNow !== undefined) && (
        <p className="mt-4 text-sm text-taupe">
          {restaurant.cuisines.slice(0, 3).join(' · ')}
          {restaurant.openNow === true && (
            <span className="text-gold-soft">{restaurant.cuisines.length ? ' · 此刻营业' : '此刻营业'}</span>
          )}
          {restaurant.openNow === false && (
            <span className="text-rose">{restaurant.cuisines.length ? ' · 或已打烊' : '或已打烊'}</span>
          )}
        </p>
      )}

      <div className="rule-gold my-6" />

      <p className="font-serif text-lg text-gold">{metricLine(result)}</p>
      {restaurant.address && <p className="mt-2 text-sm leading-relaxed text-taupe">{restaurant.address}</p>}

      <div className="mt-8 flex items-center gap-5">
        <a
          href={mapsSearchUrl(restaurant.location)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-12 flex-1 items-center justify-center rounded-full bg-gold font-serif text-base
            font-[600] text-ink transition-[filter] hover:brightness-105"
        >
          在地图打开
        </a>
        <button
          type="button"
          onClick={onReroll}
          disabled={rerolling}
          className={`min-h-12 text-base text-cream underline decoration-gold/50 underline-offset-4
            disabled:opacity-60 ${rerolling ? 'shimmer' : ''}`}
        >
          {rerolling ? '换…' : '换一家'}
        </button>
      </div>
    </div>
  )
}
