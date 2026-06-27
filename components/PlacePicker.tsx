'use client'

import { useState } from 'react'
import type { LatLng } from '@/lib/grab/provider'
import { KL_DISTRICTS } from '@/lib/kl'
import { getCurrentPosition } from '@/lib/client/geo'
import { getErrorMessage } from '@/lib/errors'

export interface PlaceValue {
  label: string
  center: LatLng
}

interface PlacePickerProps {
  title: string
  value: PlaceValue | null
  onChange: (value: PlaceValue) => void
  allowGps?: boolean
}

export function PlacePicker({ title, value, onChange, allowGps = true }: PlacePickerProps) {
  const [locating, setLocating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function useMyLocation(): Promise<void> {
    setLocating(true)
    setError(null)
    try {
      const center = await getCurrentPosition()
      onChange({ label: '我的位置', center })
    } catch (cause) {
      setError(getErrorMessage(cause))
    } finally {
      setLocating(false)
    }
  }

  return (
    <div className="rounded-2xl bg-white/5 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-slate-300">{title}</span>
        {value ? (
          <span className="max-w-[55%] truncate text-sm font-semibold text-orange-400">
            {value.label}
          </span>
        ) : (
          <span className="text-sm text-slate-500">未选</span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {allowGps && (
          <button
            type="button"
            onClick={useMyLocation}
            disabled={locating}
            className="min-h-9 rounded-full bg-orange-500/90 px-3 text-sm font-medium text-white disabled:opacity-60"
          >
            {locating ? '定位中…' : '📍 用我的定位'}
          </button>
        )}
        {KL_DISTRICTS.map((district) => {
          const active = value?.label === district.name
          return (
            <button
              key={district.name}
              type="button"
              onClick={() => onChange({ label: district.name, center: district.center })}
              className={`min-h-9 rounded-full px-3 text-sm transition-colors ${
                active ? 'bg-white text-slate-900' : 'bg-white/10 text-slate-200'
              }`}
            >
              {district.name}
            </button>
          )
        })}
      </div>

      {error && <p className="mt-2 text-xs text-rose-400">{error}</p>}
    </div>
  )
}
