'use client'

import { CUISINE_PRESETS } from '@/lib/cuisines'

interface CuisinePickerProps {
  selected: string[]
  onChange: (values: string[]) => void
}

/** Sticker colour + emoji per cuisine, so the chips read like a kid's menu. */
const CHIP: Record<string, { emoji: string; color: string }> = {
  chinese: { emoji: '🥢', color: 'var(--color-tomato)' },
  malay: { emoji: '🍛', color: 'var(--color-tangerine)' },
  indian: { emoji: '🍲', color: 'var(--color-sun)' },
  mamak: { emoji: '🫓', color: 'var(--color-mint)' },
  japanese: { emoji: '🍣', color: 'var(--color-bubble)' },
  korean: { emoji: '🌶️', color: 'var(--color-tomato)' },
  western: { emoji: '🍔', color: 'var(--color-sun)' },
  thai: { emoji: '🍤', color: 'var(--color-tangerine)' },
  cafe: { emoji: '☕', color: 'var(--color-grape)' },
  seafood: { emoji: '🦐', color: 'var(--color-sky)' },
  noodles: { emoji: '🍜', color: 'var(--color-tangerine)' },
  dessert: { emoji: '🍰', color: 'var(--color-bubble)' },
}

const FALLBACK = { emoji: '🍽️', color: 'var(--color-sun)' }

export function CuisinePicker({ selected, onChange }: CuisinePickerProps) {
  const anything = selected.length === 0

  function toggle(value: string): void {
    onChange(
      selected.includes(value)
        ? selected.filter((c) => c !== value)
        : [...selected, value],
    )
  }

  return (
    <div>
      <p className="mb-3 text-2xl text-ink">想吃哪种？🤤</p>
      <div className="flex flex-wrap gap-2.5">
        <button
          type="button"
          onClick={() => onChange([])}
          aria-pressed={anything}
          className="btn-pop min-h-11 px-4 text-lg text-ink"
          style={{ background: anything ? 'var(--color-sky)' : '#fffdf6' }}
        >
          🎲 随便啦
        </button>

        {CUISINE_PRESETS.map((cuisine) => {
          const active = selected.includes(cuisine.value)
          const { emoji, color } = CHIP[cuisine.value] ?? FALLBACK
          return (
            <button
              key={cuisine.value}
              type="button"
              onClick={() => toggle(cuisine.value)}
              aria-pressed={active}
              className="btn-pop min-h-11 px-4 text-lg text-ink"
              style={{ background: active ? color : '#fffdf6' }}
            >
              {emoji} {cuisine.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
