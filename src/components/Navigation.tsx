'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Rss, Lightbulb, PenTool } from 'lucide-react'

const navItems = [
  {
    href: '/',
    label: '热点首页',
    icon: Home
  },
  {
    href: '/rss',
    label: 'RSS微博',
    icon: Rss
  },
  {
    href: '/topics',
    label: 'AI选题',
    icon: Lightbulb
  },
  {
    href: '/writing',
    label: 'AI写作',
    icon: PenTool
  }
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-gray-900">
            微博爬取应用
          </Link>
          
          <div className="flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}