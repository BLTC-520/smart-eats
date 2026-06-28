'use client'

interface RadiusSliderProps {
  value: number
  onChange: (km: number) => void
  min?: number
  max?: number
  step?: number
}

export function RadiusSlider({ value, onChange, min = 1, max = 5, step = 0.5 }: RadiusSliderProps) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between">
        <span className="text-2xl text-ink">走多远？🚶</span>
        <span className="text-2xl text-tomato">{value} 公里</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-3 h-3 w-full cursor-pointer appearance-none rounded-full border-[2.5px] border-ink bg-paper-2"
        aria-label="搜索半径（公里）"
      />
    </label>
  )
}
