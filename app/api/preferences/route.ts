import { NextResponse } from 'next/server'
import { fail, ok } from '@/lib/api'
import { getErrorMessage } from '@/lib/errors'
import { preferencesSchema } from '@/lib/prefs/schema'
import { getPrefsStore } from '@/lib/prefs/store'

export async function GET(): Promise<NextResponse> {
  try {
    const prefs = await getPrefsStore().get()
    return NextResponse.json(ok(prefs))
  } catch (error) {
    return NextResponse.json(fail(getErrorMessage(error)), { status: 500 })
  }
}

export async function PUT(request: Request): Promise<NextResponse> {
  try {
    const body: unknown = await request.json()
    const parsed = preferencesSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(fail('偏好格式不正确'), { status: 400 })
    }
    await getPrefsStore().set(parsed.data)
    return NextResponse.json(ok(parsed.data))
  } catch (error) {
    return NextResponse.json(fail(getErrorMessage(error)), { status: 500 })
  }
}
