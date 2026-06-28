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
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 text-2xl text-ink">最爱的菜系 😋</h2>
        <div className="flex flex-wrap gap-2.5">
          {CUISINE_PRESETS.map((cuisine) => {
            const active = prefs.cuisines.includes(cuisine.value)
            return (
              <button
                key={cuisine.value}
                type="button"
                onClick={() => toggleCuisine(cuisine.value)}
                aria-pressed={active}
                className="btn-pop min-h-11 px-4 text-lg text-ink"
                style={{ background: active ? 'var(--color-mint)' : '#fffdf6' }}
              >
                {cuisine.label}
              </button>
            )
          })}
        </div>
      </section>

      <TagInput
        label="特别中意 ⭐"
        hint="命中会更常被转到"
        values={prefs.likes}
        onChange={(values) => update('likes', values)}
        placeholder="例如 茄子 / 牛肉面"
      />

      <TagInput
        label="打死不吃 🙅"
        hint="店名或菜系命中即排除"
        values={prefs.dislikes}
        onChange={(values) => update('dislikes', values)}
        placeholder="例如 胡瓜 / 印度餐"
      />

      <label className="sticker flex items-center justify-between p-4">
        <span className="text-xl text-ink">只看现在还开着的 🕐</span>
        <input
          type="checkbox"
          checked={prefs.onlyOpenNow}
          onChange={(event) => update('onlyOpenNow', event.target.checked)}
          className="h-7 w-7 accent-[var(--color-tomato)]"
        />
      </label>

      <div>
        <RadiusSlider
          value={prefs.defaultRadiusKm}
          onChange={(km) => update('defaultRadiusKm', km)}
          min={1}
          max={8}
        />
        <p className="mt-1 text-base text-ink-soft/80">「只吃饭」时的默认方圆。</p>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={save}
          disabled={!loaded || saveState === 'saving'}
          className="btn-pop min-h-13 w-full px-4 text-2xl text-ink"
          style={{ background: 'var(--color-sun)' }}
        >
          {saveState === 'saving' ? '保存中…' : saveState === 'saved' ? '记住啦 ✓' : '💾 记住口味'}
        </button>
        {error && <p className="text-center text-lg text-tomato">{error}</p>}
        <p className="text-center text-base leading-relaxed text-ink-soft/80">
          口味两支手机共享。Grab 没有菜单/食材数据，「不吃」按店名或菜系关键词近似排除。
        </p>
      </div>
    </div>
  )
}
