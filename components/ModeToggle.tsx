'use client'

import type { DecideMode } from '@/lib/client/types'

interface ModeToggleProps {
  value: DecideMode
  onChange: (mode: DecideMode) => void
}

const MODES: { value: DecideMode; label: string }[] = [
  { value: 'nearby', label: '只吃饭' },
  { value: 'onroute', label: '吃完有 plan' },
]

export function ModeToggle({ value, onChange }: ModeToggleProps) {
  return (
    <div className="flex w-full rounded-full bg-white/10 p-1 text-sm font-medium">
      {MODES.map((mode) => {
        const active = mode.value === value
        return (
          <button
            key={mode.value}
            type="button"
            onClick={() => onChange(mode.value)}
            aria-pressed={active}
            className={`min-h-11 flex-1 rounded-full px-4 transition-colors ${
              active ? 'bg-orange-500 text-white shadow' : 'text-slate-300'
            }`}
          >
            {mode.label}
          </button>
        )
      })}
    </div>
  )
}
