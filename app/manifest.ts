import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '万选食堂',
    short_name: '万选食堂',
    description: '吉隆坡 · 深夜食堂，一下决定今晚吃什么',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#1a0d11',
    theme_color: '#2a1014',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    ],
  }
}
