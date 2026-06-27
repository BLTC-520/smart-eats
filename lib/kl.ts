import type { LatLng } from '@/lib/grab/provider'

/** Default map center: KLCC, Kuala Lumpur. */
export const KL_CENTER: LatLng = { lat: 3.1578, lng: 101.7117 }

export interface District {
  name: string
  center: LatLng
}

/** Common KL areas, used as quick-pick presets when GPS is unavailable. */
export const KL_DISTRICTS: District[] = [
  { name: 'KLCC', center: { lat: 3.1578, lng: 101.7117 } },
  { name: 'Bukit Bintang', center: { lat: 3.1466, lng: 101.7113 } },
  { name: 'Bangsar', center: { lat: 3.1285, lng: 101.6786 } },
  { name: 'Mont Kiara', center: { lat: 3.1726, lng: 101.65 } },
  { name: 'Cheras', center: { lat: 3.104, lng: 101.743 } },
  { name: 'Damansara', center: { lat: 3.148, lng: 101.63 } },
  { name: 'Petaling Jaya', center: { lat: 3.1073, lng: 101.6068 } },
  { name: 'Sri Petaling', center: { lat: 3.068, lng: 101.689 } },
  { name: 'Sentul', center: { lat: 3.1869, lng: 101.6906 } },
  { name: 'Old Klang Road', center: { lat: 3.0972, lng: 101.6741 } },
]

export function findDistrict(name: string): District | undefined {
  return KL_DISTRICTS.find((d) => d.name === name)
}
