import type { Metadata, Viewport } from 'next'
import { Fraunces, Noto_Serif_SC } from 'next/font/google'
import './globals.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600', '900'],
  style: ['normal', 'italic'],
  variable: '--font-fraunces',
  display: 'swap',
})

const notoSerif = Noto_Serif_SC({
  subsets: ['latin'],
  weight: ['400', '600', '900'],
  variable: '--font-noto',
  display: 'swap',
  preload: false,
})

export const metadata: Metadata = {
  title: '万选食堂 · 今晚吃什么',
  description: '吉隆坡 · 深夜食堂。一下决定，今晚就吃这家。',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: '万选食堂',
  },
}

export const viewport: Viewport = {
  themeColor: '#2a1014',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className={`${fraunces.variable} ${notoSerif.variable} h-full antialiased`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  )
}
