import type { LatLng } from '@/lib/grab/provider'

/** Resolve the device's current position via the browser Geolocation API. */
export function getCurrentPosition(): Promise<LatLng> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      reject(new Error('此设备不支持定位'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
      (error) => {
        const denied = error.code === error.PERMISSION_DENIED
        reject(new Error(denied ? '定位权限被拒绝，请手动选区' : '定位失败，请手动选区'))
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    )
  })
}
