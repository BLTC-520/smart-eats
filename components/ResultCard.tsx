'use client'

import type { DecideResult } from '@/lib/client/types'
import { formatKm, formatMinutes, mapsSearchUrl } from '@/lib/client/format'

interface ResultCardProps {
  result: DecideResult
  rerolling?: boolean
  onReroll: () => void
  onClose: () => void
}

function metricLine(result: DecideResult): string {
  if (result.mode === 'nearby') return `距你约 ${formatKm(result.distanceKm)}`
  if (result.detourKm < 0.2) return `几乎不绕路 · 全程约 ${formatMinutes(result.baseDurationMin)}`
  return `顺路只多绕 ${formatKm(result.detourKm)} · 全程约 ${formatMinutes(result.baseDurationMin)}`
}

export function ResultCard({ result, rerolling = false, onReroll, onClose }: ResultCardProps) {
  const { restaurant } = result

  return (
    <div className="w-full rounded-3xl bg-slate-900/80 p-5 shadow-2xl ring-1 ring-white/10 backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-orange-400">今天就吃</p>
          <h2 className="mt-1 truncate text-2xl font-bold text-white">{restaurant.name}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="关闭"
          className="min-h-9 min-w-9 rounded-full bg-white/10 text-slate-300"
        >
          ✕
        </button>
      </div>

      {restaurant.cuisines.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {restaurant.cuisines.slice(0, 4).map((cuisine) => (
            <span key={cuisine} className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-slate-200">
              {cuisine}
            </span>
          ))}
          {restaurant.openNow === true && (
            <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs text-emerald-300">
              营业中
            </span>
          )}
          {restaurant.openNow === false && (
            <span className="rounded-full bg-rose-500/20 px-2.5 py-1 text-xs text-rose-300">
              可能已打烊
            </span>
          )}
        </div>
      )}

      <p className="mt-3 text-sm font-medium text-orange-300">{metricLine(result)}</p>
      {restaurant.address && <p className="mt-1 text-sm text-slate-400">{restaurant.address}</p>}

      <div className="mt-5 flex gap-2">
        <a
          href={mapsSearchUrl(restaurant.location)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-12 flex-1 items-center justify-center rounded-2xl bg-orange-500 font-semibold text-white"
        >
          在地图打开
        </a>
        <button
          type="button"
          onClick={onReroll}
          disabled={rerolling}
          className="flex min-h-12 flex-1 items-center justify-center rounded-2xl bg-white/10 font-semibold text-white disabled:opacity-60"
        >
          {rerolling ? '换…' : '换一个'}
        </button>
      </div>
    </div>
  )
}
