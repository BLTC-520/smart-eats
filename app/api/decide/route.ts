import { NextResponse } from 'next/server'
import { z } from 'zod'
import { fail, ok } from '@/lib/api'
import { getErrorMessage } from '@/lib/errors'
import { decideNearby } from '@/lib/decide/decide-service'
import { getPlacesProvider } from '@/lib/grab/grab-provider'
import { getPrefsStore } from '@/lib/prefs/store'

const latLngSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
})

const requestSchema = z.object({
  center: latLngSchema,
  radiusKm: z.number().min(0.5).max(15).default(3),
  excludeIds: z.array(z.string()).default([]),
})

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body: unknown = await request.json()
    const parsed = requestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(fail('请求参数不正确'), { status: 400 })
    }

    const prefs = await getPrefsStore().get()
    const decision = await decideNearby(
      getPlacesProvider(),
      prefs,
      parsed.data.center,
      parsed.data.radiusKm,
      parsed.data.excludeIds,
    )
    if (!decision) {
      return NextResponse.json(fail('附近没找到符合口味的餐厅，换个地点或放宽偏好试试'), {
        status: 404,
      })
    }
    return NextResponse.json(ok(decision))
  } catch (error) {
    return NextResponse.json(fail(getErrorMessage(error)), { status: 500 })
  }
}
