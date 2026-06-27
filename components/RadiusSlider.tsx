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
    <label className="block py-3">
      <span className="flex items-baseline justify-between">
        <span className="tracking-luxe text-[0.62rem] uppercase text-taupe">方圆</span>
        <span className="font-display text-base italic text-gold">{value} 公里</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-3 h-1 w-full cursor-pointer appearance-none rounded-full bg-cream/15"
        aria-label="搜索半径（公里）"
      />
    </label>
  )
}
