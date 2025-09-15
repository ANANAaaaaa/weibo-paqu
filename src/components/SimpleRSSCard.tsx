'use client'

import { RSSItem } from '@/types'
import TopicGenerator from './TopicGenerator'

interface SimpleRSSCardProps {
  item: RSSItem
}

export default function SimpleRSSCard({ item }: SimpleRSSCardProps) {
  const handleClick = () => {
    window.open(item.link, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        {/* 左侧：内容区域 */}
        <div className="flex-1 min-w-0">
          <button
            onClick={handleClick}
            className="text-left w-full text-blue-600 hover:text-blue-800 hover:underline font-medium text-sm leading-relaxed line-clamp-2"
          >
            {item.title}
          </button>
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
            <span>{item.sourceName}</span>
            <span>•</span>
            <span>{new Date(item.pubDate).toLocaleString('zh-CN')}</span>
          </div>
        </div>
        
        {/* 右侧：生成选题按钮 */}
        <div className="flex-shrink-0">
          <TopicGenerator item={item} />
        </div>
      </div>
    </div>
  )
}