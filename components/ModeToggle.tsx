'use client'

import type { DecideMode } from '@/lib/client/types'

interface ModeToggleProps {
  value: DecideMode
  onChange: (mode: DecideMode) => void
}

const MODES: { value: DecideMode; label: string }[] = [
  { value: 'nearby', label: '只吃饭' },
  { value: 'onroute', label: '吃完有约' },
]

export function ModeToggle({ value, onChange }: ModeToggleProps) {
  return (
    <div className="flex items-center gap-7">
      {MODES.map((mode) => {
        const active = mode.value === value
        return (
          <button
            key={mode.value}
            type="button"
            onClick={() => onChange(mode.value)}
            aria-pressed={active}
            className={`relative min-h-11 pb-2 text-base transition-colors ${
              active ? 'text-cream' : 'text-taupe hover:text-cream/80'
            }`}
          >
            {mode.label}
            <span
              className={`absolute inset-x-0 bottom-0 h-px origin-left bg-gold transition-transform duration-300 ${
                active ? 'scale-x-100' : 'scale-x-0'
              }`}
            />
          </button>
        )
      })}
    </div>
  )
}
