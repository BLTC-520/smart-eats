'use client'

import { useState } from 'react'
import type { LatLng } from '@/lib/grab/provider'
import type { ApiResponse, Place } from '@/lib/client/types'
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
  allowSearch?: boolean
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}

export function PlacePicker({
  title,
  value,
  onChange,
  allowGps = true,
  allowSearch = false,
}: PlacePickerProps) {
  const [locating, setLocating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<Place[]>([])

  const isPreset =
    !!value &&
    (value.label === '我的位置' || KL_DISTRICTS.some((d) => d.name === value.label))

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

  async function runSearch(): Promise<void> {
    const q = query.trim()
    if (q.length === 0) return
    setSearching(true)
    setError(null)
    try {
      const response = await fetch(`/api/places?q=${encodeURIComponent(q)}`)
      const json = (await response.json()) as ApiResponse<{ places: Place[] }>
      if (!json.success || !json.data) throw new Error(json.error ?? '搜不到这个地点')
      setResults(json.data.places)
      if (json.data.places.length === 0) setError('搜不到这个地点，换个词试试')
    } catch (cause) {
      setError(getErrorMessage(cause))
    } finally {
      setSearching(false)
    }
  }

  function pickResult(place: Place): void {
    onChange({ label: place.name, center: place.location })
    setResults([])
    setQuery('')
  }

  return (
    <div>
      <p className="mb-2.5 text-2xl text-ink">{title}</p>

      {allowSearch && (
        <div className="mb-3">
          <div className="flex items-stretch gap-2.5">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  void runSearch()
                }
              }}
              placeholder="搜地点，如 KLCC Park"
              className="sticker min-h-11 flex-1 px-4 text-base text-ink placeholder:text-ink-soft/45 focus:outline-none"
            />
            <button
              type="button"
              onClick={runSearch}
              disabled={searching}
              className="btn-pop min-h-11 px-4 text-lg text-ink"
              style={{ background: 'var(--color-sun)' }}
            >
              {searching ? '…' : '🔎 搜'}
            </button>
          </div>
          {results.length > 0 && (
            <div className="mt-2.5 flex flex-col gap-2">
              {results.map((place) => (
                <button
                  key={place.id}
                  type="button"
                  onClick={() => pickResult(place)}
                  className="sticker px-3.5 py-2 text-left text-base text-ink"
                >
                  <span className="block leading-tight">📍 {place.name}</span>
                  {place.address && (
                    <span className="block truncate text-sm text-ink-soft/70">{place.address}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2.5">
        {value && !isPreset && (
          <span
            className="btn-pop inline-flex min-h-11 items-center px-4 text-lg text-ink"
            style={{ background: 'var(--color-sky)' }}
          >
            📍 {truncate(value.label, 14)} ✓
          </span>
        )}
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
