import './globals.css'
import type { Metadata } from 'next'
import Navigation from '@/components/Navigation'

export const metadata: Metadata = {
  title: '微博爬取应用',
  description: '微博热点和RSS内容聚合平台',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        <Navigation />
        {children}
      </body>
    </html>
  )
}