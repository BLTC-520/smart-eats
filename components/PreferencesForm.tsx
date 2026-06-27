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
    <div className="space-y-6">
      <section>
        <h2 className="mb-2 text-sm font-semibold text-slate-200">喜欢的菜系</h2>
        <div className="flex flex-wrap gap-2">
          {CUISINE_PRESETS.map((cuisine) => {
            const active = prefs.cuisines.includes(cuisine.value)
            return (
              <button
                key={cuisine.value}
                type="button"
                onClick={() => toggleCuisine(cuisine.value)}
                className={`min-h-10 rounded-full px-3 text-sm transition-colors ${
                  active ? 'bg-orange-500 text-white' : 'bg-white/10 text-slate-200'
                }`}
              >
                {cuisine.label}
              </button>
            )
          })}
        </div>
      </section>

      <TagInput
        label="特别喜欢"
        hint="命中会更常被推荐"
        values={prefs.likes}
        onChange={(values) => update('likes', values)}
        placeholder="例如 茄子 / 牛肉面"
      />

      <TagInput
        label="不吃 / 排除"
        hint="店名或菜系命中就排除"
        values={prefs.dislikes}
        onChange={(values) => update('dislikes', values)}
        placeholder="例如 胡瓜 / 印度餐"
      />

      <label className="flex items-center justify-between rounded-2xl bg-white/5 p-3">
        <span className="text-sm text-slate-200">只推荐现在营业的</span>
        <input
          type="checkbox"
          checked={prefs.onlyOpenNow}
          onChange={(event) => update('onlyOpenNow', event.target.checked)}
          className="h-6 w-6 accent-orange-500"
        />
      </label>

      <div className="rounded-2xl bg-white/5 p-3">
        <RadiusSlider
          value={prefs.defaultRadiusKm}
          onChange={(km) => update('defaultRadiusKm', km)}
          min={1}
          max={8}
        />
        <p className="mt-2 text-xs text-slate-500">「只吃饭」模式的默认搜索半径。</p>
      </div>

      <div className="space-y-2">
        <button
          type="button"
          onClick={save}
          disabled={!loaded || saveState === 'saving'}
          className="min-h-12 w-full rounded-2xl bg-orange-500 font-semibold text-white disabled:opacity-60"
        >
          {saveState === 'saving' ? '保存中…' : saveState === 'saved' ? '已保存 ✓' : '保存偏好'}
        </button>
        {error && <p className="text-center text-sm text-rose-400">{error}</p>}
        <p className="text-center text-xs text-slate-500">
          偏好两支手机共享。Grab 数据没有菜单/食材，「不吃」按店名或菜系关键词近似排除。
        </p>
      </div>
    </div>
  )
}
