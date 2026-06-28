import { NextResponse } from 'next/server'
import { z } from 'zod'
import { fail, ok } from '@/lib/api'
import { getErrorMessage } from '@/lib/errors'
import { getPlacesProvider } from '@/lib/grab/grab-provider'

const querySchema = z.string().trim().min(1).max(80)

/** GET /api/places?q=... — free-text place search (parks, malls, landmarks…). */
export async function GET(request: Request): Promise<NextResponse> {
  try {
    const url = new URL(request.url)
    const parsed = querySchema.safeParse(url.searchParams.get('q') ?? '')
    if (!parsed.success) {
      return NextResponse.json(fail('输入要搜的地点'), { status: 400 })
    }

    const places = await getPlacesProvider().searchPlaces({ query: parsed.data })
    return NextResponse.json(ok({ places }))
  } catch (error) {
    return NextResponse.json(fail(getErrorMessage(error)), { status: 500 })
  }
}
