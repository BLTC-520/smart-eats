import type { Metadata, Viewport } from 'next'
import { Gaegu, ZCOOL_KuaiLe } from 'next/font/google'
import './globals.css'

// Gaegu = wobbly kid's-handwriting Latin; ZCOOL KuaiLe = bubbly cartoon Chinese.
const gaegu = Gaegu({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-gaegu',
  display: 'swap',
})

const kuaile = ZCOOL_KuaiLe({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-kuaile',
  display: 'swap',
  preload: false,
})

export const metadata: Metadata = {
  title: '万选食堂 · 转一转吃什么',
  description: '吉隆坡 · 选个菜系，转个盘，今晚就吃这家！',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '万选食堂',
  },
}

export const viewport: Viewport = {
  themeColor: '#fff4d6',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className={`${gaegu.variable} ${kuaile.variable} h-full antialiased`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  )
}
