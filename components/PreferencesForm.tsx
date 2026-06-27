'use client'

import { useEffect, useState } from 'react'
import { TagInput } from '@/components/TagInput'
import { RadiusSlider } from '@/components/RadiusSlider'
import { CUISINE_PRESETS } from '@/lib/cuisines'
import { getErrorMessage } from '@/lib/errors'
import { defaultPreferences, type Preferences } from '@/lib/prefs/schema'
import type { ApiResponse } from '@/lib/api'

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

export function PreferencesForm() {
  const [prefs, setPrefs] = useState<Preferences>(defaultPreferences)
  const [loaded, setLoaded] = useState(false)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/preferences')
      .then((response) => response.json() as Promise<ApiResponse<Preferences>>)
      .then((json) => {
        if (json.success && json.data) setPrefs(json.data)
      })
      .catch(() => undefined)
      .finally(() => setLoaded(true))
  }, [])

  function update<K extends keyof Preferences>(key: K, value: Preferences[K]): void {
    setPrefs((current) => ({ ...current, [key]: value }))
    setSaveState('idle')
  }

  function toggleCuisine(value: string): void {
    const next = prefs.cuisines.includes(value)
      ? prefs.cuisines.filter((cuisine) => cuisine !== value)
      : [...prefs.cuisines, value]
    update('cuisines', next)
  }

  async function save(): Promise<void> {
    setSaveState('saving')
    setError(null)
    try {
      const response = await fetch('/api/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs),
      })
      const json = (await response.json()) as ApiResponse<Preferences>
      if (!json.success) throw new Error(json.error ?? '保存失败')
      setSaveState('saved')
    } catch (cause) {
      setError(getErrorMessage(cause))
      setSaveState('error')
    }
  }

  return (
    <div className="space-y-9">
      <section>
        <h2 className="tracking-luxe mb-3 text-[0.62rem] uppercase text-gold-soft">偏爱菜系</h2>
        <div className="flex flex-wrap gap-2.5">
          {CUISINE_PRESETS.map((cuisine) => {
            const active = prefs.cuisines.includes(cuisine.value)
            return (
              <button
                key={cuisine.value}
                type="button"
                onClick={() => toggleCuisine(cuisine.value)}
                className={`min-h-10 rounded-full border px-3.5 text-sm transition-colors ${
                  active
                    ? 'border-gold bg-gold text-ink'
                    : 'border-cream/20 text-cream/85 hover:border-gold/60'
                }`}
              >
                {cuisine.label}
              </button>
            )
          })}
        </div>
      </section>

      <TagInput
        label="特别中意"
        hint="命中会更常被端上桌"
        values={prefs.likes}
        onChange={(values) => update('likes', values)}
        placeholder="例如 茄子 / 牛肉面"
      />

      <TagInput
        label="一概不吃"
        hint="店名或菜系命中即排除"
        values={prefs.dislikes}
        onChange={(values) => update('dislikes', values)}
        placeholder="例如 胡瓜 / 印度餐"
      />

      <label className="flex items-center justify-between border-y border-cream/12 py-4">
        <span className="text-base text-cream">只看此刻还在营业的</span>
        <input
          type="checkbox"
          checked={prefs.onlyOpenNow}
          onChange={(event) => update('onlyOpenNow', event.target.checked)}
          className="h-6 w-6 accent-[var(--color-gold)]"
        />
      </label>

      <div>
        <RadiusSlider
          value={prefs.defaultRadiusKm}
          onChange={(km) => update('defaultRadiusKm', km)}
          min={1}
          max={8}
        />
        <p className="mt-1 text-xs text-taupe/80">「只吃饭」时的默认方圆。</p>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={save}
          disabled={!loaded || saveState === 'saving'}
          className="min-h-12 w-full rounded-full bg-gold font-serif text-base font-[600] text-ink
            transition-[filter] hover:brightness-105 disabled:opacity-60"
        >
          {saveState === 'saving' ? '保存中…' : saveState === 'saved' ? '已记下 ✓' : '记住口味'}
        </button>
        {error && <p className="text-center text-sm text-rose">{error}</p>}
        <p className="text-center text-xs leading-relaxed text-taupe/80">
          口味两支手机共享。Grab 没有菜单/食材数据，「不吃」按店名或菜系关键词近似排除。
        </p>
      </div>
    </div>
  )
}
