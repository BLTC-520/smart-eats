import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '万选吃饭 · 一键决定吃什么',
  description: '吉隆坡 · 一个按钮帮你和她决定今天吃什么，不再纠结。',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: '吃这个',
  },
}

export const viewport: Viewport = {
  themeColor: '#f97316',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-dvh">{children}</body>
    </html>
  )
}
