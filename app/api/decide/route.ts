import { NextResponse } from 'next/server'
import { z } from 'zod'
import { fail, ok } from '@/lib/api'
import { getErrorMessage } from '@/lib/errors'
import { nearbyWheel } from '@/lib/decide/decide-service'
import { getPlacesProvider } from '@/lib/grab/grab-provider'
import { getPrefsStore } from '@/lib/prefs/store'

const latLngSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
})

const requestSchema = z.object({
  userLocation: latLngSchema,
  diningArea: latLngSchema,
  cuisines: z.array(z.string()).max(20).default([]),
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
    const wheel = await nearbyWheel(
      getPlacesProvider(),
      prefs,
      parsed.data.userLocation,
      parsed.data.diningArea,
      parsed.data.cuisines,
      parsed.data.excludeIds,
    )
    if (wheel.candidates.length === 0) {
      return NextResponse.json(fail('附近没找到这个菜系的餐厅，换个地点或菜系试试'), {
        status: 404,
      })
    }
    return NextResponse.json(ok(wheel))
  } catch (error) {
    return NextResponse.json(fail(getErrorMessage(error)), { status: 500 })
  }
}
