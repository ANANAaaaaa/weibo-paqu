'use client'

import { HotItem } from '@/types'
import { ExternalLink, Clock, TrendingUp } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import TopicGenerator from './TopicGenerator'

interface ContentCardProps {
  item: HotItem
  onSelect?: (item: HotItem) => void
}

export default function ContentCard({ item, onSelect }: ContentCardProps) {
  const handleClick = () => {
    if (onSelect) {
      onSelect(item)
    }
  }

  const timeAgo = formatDistanceToNow(new Date(item.pubDate), {
    addSuffix: true,
    locale: zhCN
  })

  return (
    <div 
      className="waterfall-item bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
            {item.sourceName}
          </span>
          {item.score && (
            <div className="flex items-center text-xs text-orange-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              {item.score}
            </div>
          )}
        </div>

        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
          {item.title}
        </h3>

        {item.summary && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-3">
            {item.summary}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <div className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {timeAgo}
          </div>
          {item.link && (
            <ExternalLink className="w-3 h-3" />
          )}
        </div>

        {/* 生成选题按钮 */}
        <TopicGenerator item={item} />
      </div>
    </div>
  )
}