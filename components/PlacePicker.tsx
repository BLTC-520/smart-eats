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
    <div className="py-3">
      <div className="flex items-baseline justify-between">
        <span className="tracking-luxe text-[0.62rem] uppercase text-taupe">{title}</span>
        <span
          className={`max-w-[58%] truncate font-display text-base italic ${
            value ? 'text-gold' : 'text-taupe/60'
          }`}
        >
          {value ? value.label : '待选'}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
        {allowGps && (
          <button
            type="button"
            onClick={useMyLocation}
            disabled={locating}
            className="min-h-9 text-sm text-gold underline decoration-gold/40 underline-offset-4 disabled:opacity-60"
          >
            {locating ? '定位中…' : '⌖ 我的定位'}
          </button>
        )}
        {KL_DISTRICTS.map((district) => {
          const active = value?.label === district.name
          return (
            <button
              key={district.name}
              type="button"
              onClick={() => onChange({ label: district.name, center: district.center })}
              className={`min-h-9 border-b text-sm transition-colors ${
                active
                  ? 'border-gold text-cream'
                  : 'border-transparent text-taupe hover:text-cream/80'
              }`}
            >
              {district.name}
            </button>
          )
        })}
      </div>

      {error && <p className="mt-2 text-xs text-rose">{error}</p>}
    </div>
  )
}
