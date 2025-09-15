'use client'

import { useState } from 'react'
import { X, Loader2, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Topic {
  title: string
  description: string
}

interface TopicModalProps {
  isOpen: boolean
  onClose: () => void
  topics: Topic[]
  originalItem: any
  isLoading?: boolean
}

export default function TopicModal({ 
  isOpen, 
  onClose, 
  topics, 
  originalItem,
  isLoading = false 
}: TopicModalProps) {
  const router = useRouter()

  const handleTopicSelect = (topic: Topic) => {
    // 跳转到AI写作页面，传递选题和原始内容
    const params = new URLSearchParams({
      originalTitle: originalItem.title,
      originalSummary: originalItem.summary || originalItem.description || '',
      selectedTopic: topic.title,
      topicDescription: topic.description,
      platform: originalItem.platform || 'rss'
    })
    
    router.push(`/ai-writing?${params.toString()}`)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">AI生成的选题方向</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 原始内容预览 */}
        <div className="p-4 bg-gray-50 border-b">
          <p className="text-sm text-gray-600 mb-1">基于热点内容：</p>
          <p className="font-medium text-gray-900 line-clamp-2">{originalItem.title}</p>
        </div>

        {/* 内容区域 */}
        <div className="p-6 overflow-y-auto max-h-96">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              <span className="ml-3 text-gray-600">AI正在生成选题...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {topics.map((topic, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:bg-purple-50 transition-all cursor-pointer group"
                  onClick={() => handleTopicSelect(topic)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-2 group-hover:text-purple-700">
                        选题{index + 1}：{topic.title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {topic.description}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 ml-3 flex-shrink-0" />
                  </div>
                  <div className="mt-3 text-xs text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    点击进入AI写作页面
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 底部 */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              选择一个选题方向，进入AI写作页面生成文案
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}