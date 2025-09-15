'use client'

import { Topic, HotItem } from '@/types'
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

interface TopicCardProps {
  topic: Topic
  hotItems: HotItem[]
  onSelect: (topic: Topic) => void
}

export default function TopicCard({ topic, hotItems, onSelect }: TopicCardProps) {
  const [showRefs, setShowRefs] = useState(false)

  const relatedItems = hotItems.filter(item => 
    topic.refs.includes(item.id)
  )

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      <div className="p-6">
        <h3 className="font-semibold text-gray-900 mb-3">
          {topic.title}
        </h3>
        
        <p className="text-gray-600 mb-4 text-sm">
          {topic.angle}
        </p>

        {relatedItems.length > 0 && (
          <div className="mb-4">
            <button
              onClick={() => setShowRefs(!showRefs)}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
            >
              相关热点 ({relatedItems.length})
              {showRefs ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            
            {showRefs && (
              <div className="mt-2 space-y-2">
                {relatedItems.map((item) => (
                  <div key={item.id} className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
                    <div className="font-medium">{item.title}</div>
                    {item.summary && (
                      <div className="mt-1 line-clamp-2">{item.summary}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => onSelect(topic)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          选择此选题
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}