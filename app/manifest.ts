import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '万选食堂',
    short_name: '万选食堂',
    description: '吉隆坡 · 选个菜系，转个盘，今晚就吃这家',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#fff4d6',
    theme_color: '#fff4d6',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    ],
  }
}
