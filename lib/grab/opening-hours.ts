/** Parse Grab's `opening_hours` JSON string and decide if a place is open now.
 *  Grab stores days as lowercase names mapping to [["HH:MM","HH:MM"], …] ranges.
 *  Returns `undefined` when hours are unknown/empty (so callers don't over-filter). */

type DayRanges = Record<string, [string, string][]>

const DAYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const

const KL_OFFSET_MINUTES = 8 * 60 // Asia/Kuala_Lumpur is UTC+8 (no DST)

function toMinutes(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value)
  if (!match) return null
  return Number(match[1]) * 60 + Number(match[2])
}

export function isOpenNow(
  openingHoursRaw: string | undefined,
  now: Date = new Date(),
): boolean | undefined {
  if (!openingHoursRaw) return undefined

  let parsed: unknown
  try {
    parsed = JSON.parse(openingHoursRaw)
  } catch {
    return undefined
  }
  if (!parsed || typeof parsed !== 'object') return undefined

  const hours = parsed as DayRanges
  if (Object.keys(hours).length === 0) return undefined

  // Shift epoch by +8h, then read UTC fields → KL wall-clock, timezone-independent.
  const kl = new Date(now.getTime() + KL_OFFSET_MINUTES * 60_000)
  const ranges = hours[DAYS[kl.getUTCDay()]]
  if (!Array.isArray(ranges) || ranges.length === 0) return false

  const minutes = kl.getUTCHours() * 60 + kl.getUTCMinutes()
  return ranges.some((range) => {
    if (!Array.isArray(range) || range.length < 2) return false
    const start = toMinutes(range[0])
    const end = toMinutes(range[1])
    if (start == null || end == null) return false
    // Handle overnight ranges (e.g. 18:00–02:00).
    return end >= start ? minutes >= start && minutes <= end : minutes >= start || minutes <= end
  })
}
