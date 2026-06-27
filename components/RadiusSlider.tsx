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
      <span className="mb-2 flex items-center justify-between text-sm text-slate-300">
        <span>找多远以内</span>
        <span className="font-semibold text-orange-400">{value} km</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-orange-500"
        aria-label="搜索半径（公里）"
      />
    </label>
  )
}
