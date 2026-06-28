'use client'

import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import type { DecideMode } from '@/lib/client/types'

interface SearchingLoaderProps {
  mode: DecideMode
  /** `null` while still searching; the real count once the search returns. */
  found: number | null
}

/** Food emojis that bob along the bottom while we hunt. */
const FOODS = ['🍜', '🍗', '🍕', '🍱', '🍢', '🍤', '🌮', '🍰'] as const

/** Playful status lines that cycle while searching. */
const HUNTING_LINES = [
  '正在翻遍这一带的餐厅…',
  '闻一闻哪家最香～',
  '偷看大家在排哪家…',
  '问问老饕去哪吃…',
  '快好了，再等一下下…',
] as const

const COUNTER_MS = 70
const LINE_MS = 1100

function bobDelay(ms: number): CSSProperties {
  return { animationDelay: `${ms}ms` }
}

export function SearchingLoader({ mode, found }: SearchingLoaderProps) {
  const [tick, setTick] = useState(0)
  const [line, setLine] = useState(0)
  const done = found !== null

  useEffect(() => {
    if (done) return
    const counter = setInterval(() => setTick((t) => t + 1), COUNTER_MS)
    const lines = setInterval(() => setLine((l) => (l + 1) % HUNTING_LINES.length), LINE_MS)
    return () => {
      clearInterval(counter)
      clearInterval(lines)
    }
  }, [done])

  const place = mode === 'onroute' ? '这条路上' : '附近'
  // While hunting the number scampers upward; on done it settles on the truth.
  const count = done ? (found as number) : tick

  return (
    <section className="flex flex-1 flex-col items-center justify-center py-10">
      <div className={`sticker ${done ? 'tilt-r' : 'tilt-l'} pop w-full max-w-xs px-6 py-8 text-center`}>
        <div className="text-6xl" aria-hidden="true">
          <span className={done ? 'pop inline-block' : 'wiggle inline-block'}>{done ? '🎉' : '🍽️'}</span>
        </div>

        <p className="mt-4 text-2xl text-ink-soft">{done ? `${place}找到` : '正在为你找好吃的'}</p>

        <p
          className="leading-none text-ink"
          style={{ fontSize: '4.5rem', color: 'var(--color-tomato)' }}
          aria-live="polite"
        >
          {count}
          <span className="ml-1 align-middle text-3xl text-ink">间</span>
        </p>

        <p className="min-h-7 text-xl text-ink-soft">
          {done ? '这就装进转盘，转一转！🎡' : HUNTING_LINES[line]}
        </p>

        <div className="mt-5 flex justify-center gap-1.5 text-2xl" aria-hidden="true">
          {FOODS.map((food, i) => (
            <span key={food} className="bob inline-block" style={bobDelay(i * 110)}>
              {food}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
