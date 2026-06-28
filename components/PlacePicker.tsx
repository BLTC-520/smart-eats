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
    <div>
      <p className="mb-2.5 text-2xl text-ink">{title}</p>

      <div className="flex flex-wrap gap-2.5">
        {allowGps && (
          <button
            type="button"
            onClick={useMyLocation}
            disabled={locating}
            className="btn-pop min-h-11 px-4 text-lg text-ink"
            style={{ background: value?.label === '我的位置' ? 'var(--color-sky)' : '#fffdf6' }}
          >
            {locating ? '定位中…' : '⌖ 我在这'}
          </button>
        )}
        {KL_DISTRICTS.map((district) => {
          const active = value?.label === district.name
          return (
            <button
              key={district.name}
              type="button"
              onClick={() => onChange({ label: district.name, center: district.center })}
              aria-pressed={active}
              className="btn-pop min-h-11 px-4 text-lg text-ink"
              style={{ background: active ? 'var(--color-sky)' : '#fffdf6' }}
            >
              {district.name}
            </button>
          )
        })}
      </div>

      {error && <p className="mt-2 text-base text-tomato">{error}</p>}
    </div>
  )
}
