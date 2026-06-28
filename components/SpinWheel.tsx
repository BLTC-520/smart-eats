'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

export interface WheelItem {
  id: string
  label: string
}

interface SpinWheelProps {
  items: WheelItem[]
  onSpinStart?: () => void
  onResult: (index: number) => void
}

const C = 100 // svg centre
const R = 96 // wheel radius
const SPIN_MS = 4200
const EXTRA_TURNS = 5

const SLICE_COLORS = [
  'var(--color-tomato)',
  'var(--color-sun)',
  'var(--color-sky)',
  'var(--color-mint)',
  'var(--color-grape)',
  'var(--color-tangerine)',
  'var(--color-bubble)',
]

function pointOnCircle(r: number, angleDeg: number): [number, number] {
  const a = ((angleDeg - 90) * Math.PI) / 180
  return [C + r * Math.cos(a), C + r * Math.sin(a)]
}

/** No two touching slices (including the wrap from last→first) share a colour. */
function sliceColors(n: number): string[] {
  const out: string[] = []
  for (let i = 0; i < n; i++) {
    let c = SLICE_COLORS[i % SLICE_COLORS.length]
    if (i > 0 && c === out[i - 1]) c = SLICE_COLORS[(i + 1) % SLICE_COLORS.length]
    if (i === n - 1 && c === out[0]) c = SLICE_COLORS[(i + 2) % SLICE_COLORS.length]
    out.push(c)
  }
  return out
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}

/** Rotation that brings slice `index` under the top pointer, plus a few turns. */
function rotationFor(current: number, index: number, n: number): number {
  const seg = 360 / n
  const mid = index * seg + seg / 2
  const jitter = (Math.random() - 0.5) * seg * 0.55
  const target = (360 - (((mid + jitter) % 360) + 360) % 360) % 360
  const currentMod = ((current % 360) + 360) % 360
  return current + EXTRA_TURNS * 360 + ((target - currentMod + 360) % 360)
}

export function SpinWheel({ items, onSpinStart, onResult }: SpinWheelProps) {
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const n = items.length
  const seg = 360 / n
  const colors = useMemo(() => sliceColors(n), [n])
  const fontSize = n > 6 ? 9 : n > 4 ? 10.5 : 12
  const maxChars = n > 6 ? 8 : 11

  // The parent re-mounts this via `key` for a new batch, so a fresh start needs
  // only the unmount cleanup below — no in-effect state reset required.
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )

  function spin(): void {
    if (spinning || n === 0) return
    const index = Math.floor(Math.random() * n)
    onSpinStart?.()
    setSpinning(true)
    setRotation((current) => rotationFor(current, index, n))
    timer.current = setTimeout(() => {
      setSpinning(false)
      onResult(index)
    }, SPIN_MS)
  }

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[360px]">
      {/* down-pointing marker at 12 o'clock */}
      <div className="bob absolute -top-1 left-1/2 z-20 -translate-x-1/2">
        <svg width="46" height="40" viewBox="0 0 46 40" aria-hidden="true">
          <path
            d="M23 38 L6 8 Q23 -2 40 8 Z"
            fill="var(--color-tomato)"
            stroke="var(--color-ink)"
            strokeWidth="3"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div
        className="h-full w-full"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: spinning ? `transform ${SPIN_MS}ms cubic-bezier(0.16, 1, 0.32, 1)` : 'none',
        }}
      >
        <svg viewBox="-4 -4 208 208" className="h-full w-full drop-shadow-[5px_5px_0_var(--color-ink)]">
          {items.map((item, i) => {
            const start = i * seg
            const [x1, y1] = pointOnCircle(R, start)
            const [x2, y2] = pointOnCircle(R, start + seg)
            const large = seg > 180 ? 1 : 0
            const d =
              n === 1
                ? `M ${C - R} ${C} A ${R} ${R} 0 1 1 ${C + R} ${C} A ${R} ${R} 0 1 1 ${C - R} ${C} Z`
                : `M ${C} ${C} L ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} Z`
            const mid = start + seg / 2
            const flip = mid > 90 && mid < 270
            // Move to centre, rotate to the slice, then step outward along the radius.
            const labelT = `translate(${C} ${C}) rotate(${mid}) translate(0 ${-R * 0.58}) ${flip ? 'rotate(180)' : ''}`
            return (
              <g key={item.id}>
                <path d={d} fill={colors[i]} stroke="var(--color-ink)" strokeWidth="2.5" strokeLinejoin="round" />
                <text
                  transform={labelT}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={fontSize}
                  fontWeight={700}
                  fill="var(--color-ink)"
                  style={{ fontFamily: 'var(--font-hand)' }}
                >
                  {truncate(item.label, maxChars)}
                </text>
              </g>
            )
          })}
          <circle cx={C} cy={C} r={R} fill="none" stroke="var(--color-ink)" strokeWidth="3.5" />
        </svg>
      </div>

      {/* centre SPIN hub */}
      <button
        type="button"
        onClick={spin}
        disabled={spinning}
        aria-label="转动转盘"
        className="btn-pop absolute left-1/2 top-1/2 z-10 grid h-[27%] w-[27%] -translate-x-1/2 -translate-y-1/2
          place-items-center rounded-full text-center leading-none text-ink disabled:opacity-100"
        style={{ background: 'var(--color-sun)' }}
      >
        <span className={`text-2xl ${spinning ? 'wiggle' : ''}`}>{spinning ? '转~' : '转!'}</span>
      </button>
    </div>
  )
}
