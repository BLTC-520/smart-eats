'use client'

import type { DecideMode } from '@/lib/client/types'

interface ModeToggleProps {
  value: DecideMode
  onChange: (mode: DecideMode) => void
}

const MODES: { value: DecideMode; label: string; emoji: string }[] = [
  { value: 'nearby', label: '只吃饭', emoji: '🍚' },
  { value: 'onroute', label: '吃完有约', emoji: '🚗' },
]

export function ModeToggle({ value, onChange }: ModeToggleProps) {
  return (
    <div className="flex gap-3">
      {MODES.map((mode) => {
        const active = mode.value === value
        return (
          <button
            key={mode.value}
            type="button"
            onClick={() => onChange(mode.value)}
            aria-pressed={active}
            className="btn-pop min-h-12 min-w-0 flex-1 truncate px-3 text-xl text-ink"
            style={{ background: active ? 'var(--color-mint)' : '#fffdf6' }}
          >
            {mode.emoji} {mode.label}
          </button>
        )
      })}
    </div>
  )
}
