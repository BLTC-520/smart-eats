/** Cuisine presets shown in the preferences UI.
 *  `value` is the English keyword sent to Grab + matched against categories;
 *  `label` is the Chinese label shown to the user. */
export interface CuisinePreset {
  value: string
  label: string
}

export const CUISINE_PRESETS: CuisinePreset[] = [
  { value: 'chinese', label: '华人餐' },
  { value: 'malay', label: '马来餐' },
  { value: 'indian', label: '印度餐' },
  { value: 'mamak', label: 'Mamak' },
  { value: 'japanese', label: '日本菜' },
  { value: 'korean', label: '韩国菜' },
  { value: 'western', label: '西餐' },
  { value: 'thai', label: '泰国菜' },
  { value: 'cafe', label: '咖啡馆' },
  { value: 'seafood', label: '海鲜' },
  { value: 'noodles', label: '面食' },
  { value: 'dessert', label: '甜点' },
]

export function cuisineLabel(value: string): string {
  return CUISINE_PRESETS.find((c) => c.value === value)?.label ?? value
}
