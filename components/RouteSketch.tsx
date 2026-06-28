import type { LatLng } from '@/lib/client/types'

interface RouteSketchProps {
  origin: LatLng
  restaurant: LatLng
  destination: LatLng
  restaurantName: string
}

const W = 320
const H = 196
const PAD = 50
/** Minimum lat/lng span so coincident/collinear points still spread out. */
const MIN_SPAN = 0.004

type Point = [number, number]

/** Place the three coordinates into the sketch box, keeping their real
 *  relative geography (so a backtracking detour visibly zig-zags). */
function project(points: readonly LatLng[]): Point[] {
  const lats = points.map((p) => p.lat)
  const lngs = points.map((p) => p.lng)
  const spanLat = Math.max(Math.max(...lats) - Math.min(...lats), MIN_SPAN)
  const spanLng = Math.max(Math.max(...lngs) - Math.min(...lngs), MIN_SPAN)
  const cLat = (Math.max(...lats) + Math.min(...lats)) / 2
  const cLng = (Math.max(...lngs) + Math.min(...lngs)) / 2
  return points.map((p) => [
    PAD + ((p.lng - (cLng - spanLng / 2)) / spanLng) * (W - 2 * PAD),
    PAD + (1 - (p.lat - (cLat - spanLat / 2)) / spanLat) * (H - 2 * PAD),
  ])
}

/** A casually-bowed path through the points, alternating the bow side. */
function wavyPath(points: readonly Point[]): string {
  let d = `M ${points[0][0]} ${points[0][1]}`
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1]
    const [x1, y1] = points[i]
    const dx = x1 - x0
    const dy = y1 - y0
    const len = Math.hypot(dx, dy) || 1
    const off = 16 * (i % 2 === 1 ? 1 : -1)
    const cx = (x0 + x1) / 2 + (-dy / len) * off
    const cy = (y0 + y1) / 2 + (dx / len) * off
    d += ` Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`
  }
  return d
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}

export function RouteSketch({ origin, restaurant, destination, restaurantName }: RouteSketchProps) {
  const [o, r, d] = project([origin, restaurant, destination])
  const path = wavyPath([o, r, d])

  return (
    <div className="sticker tilt-r overflow-hidden p-2">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="顺路示意图">
        {/* hand-drawn route + a car that loops along it */}
        <path
          id="route-line"
          className="route-draw"
          d={path}
          pathLength={1}
          fill="none"
          stroke="var(--color-ink)"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* origin */}
        <g>
          <circle cx={o[0]} cy={o[1]} r={9} fill="var(--color-mint)" stroke="var(--color-ink)" strokeWidth={3} />
          <text x={o[0]} y={o[1] + 26} textAnchor="middle" fontSize={15} fill="var(--color-ink)" style={{ fontFamily: 'var(--font-hand)' }}>
            你在这
          </text>
        </g>

        {/* destination */}
        <g>
          <circle cx={d[0]} cy={d[1]} r={9} fill="var(--color-sky)" stroke="var(--color-ink)" strokeWidth={3} />
          <text x={d[0]} y={d[1] + 26} textAnchor="middle" fontSize={15} fill="var(--color-ink)" style={{ fontFamily: 'var(--font-hand)' }}>
            🚩 目的地
          </text>
        </g>

        {/* restaurant stop (drawn last so it sits on top) */}
        <g>
          <circle cx={r[0]} cy={r[1]} r={13} fill="var(--color-tomato)" stroke="var(--color-ink)" strokeWidth={3} />
          <text x={r[0]} y={r[1] + 1} textAnchor="middle" dominantBaseline="central" fontSize={13}>🍽️</text>
          <text x={r[0]} y={r[1] - 22} textAnchor="middle" fontSize={15} fill="var(--color-ink)" style={{ fontFamily: 'var(--font-hand)' }}>
            {truncate(restaurantName, 12)}
          </text>
        </g>

        <text fontSize={20} textAnchor="middle" dominantBaseline="central">
          🚗
          <animateMotion dur="2.6s" begin="2s" repeatCount="indefinite">
            <mpath href="#route-line" />
          </animateMotion>
        </text>
      </svg>
    </div>
  )
}
