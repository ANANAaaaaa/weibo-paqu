'use client'

import { useState } from 'react'
import { Lightbulb, Loader2 } from 'lucide-react'
import { HotItem } from '@/types'
import TopicModal from './TopicModal'

interface TopicGeneratorProps {
  item: HotItem
}

interface Topic {
  title: string
  description: string
}

export default function TopicGenerator({ item }: TopicGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [topics, setTopics] = useState<Topic[]>([])
  const [showModal, setShowModal] = useState(false)

  const generateTopics = async () => {
    setIsGenerating(true)
    setShowModal(true)
    
    try {
      const response = await fetch('/api/ai/generate-topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: item.title,
          summary: item.summary || '',
          platform: item.platform
        })
      })

      if (!response.ok) {
        throw new Error('生成选题失败')
      }

      const data = await response.json()
      
      // 解析返回的选题数据
      const parsedTopics = parseTopicsFromResponse(data.topics || [])
      setTopics(parsedTopics)
    } catch (error) {
      console.error('生成选题失败:', error)
      alert('生成选题失败，请稍后重试')
      setShowModal(false)
    } finally {
      setIsGenerating(false)
    }
  }

  const parseTopicsFromResponse = (topicsArray: string[]): Topic[] => {
    const topics: Topic[] = []
    
    for (let i = 0; i < topicsArray.length; i++) {
      const topicText = topicsArray[i]
      
      // 尝试解析格式：选题X：[标题] 说明：[描述]
      const titleMatch = topicText.match(/选题\d+：(.+?)(?:\s+说明：|$)/)
      const descMatch = topicText.match(/说明：(.+)$/)
      
      if (titleMatch) {
        topics.push({
          title: titleMatch[1].trim(),
          description: descMatch ? descMatch[1].trim() : '暂无详细说明'
        })
      } else {
        // 如果格式不匹配，直接使用原文本作为标题
        topics.push({
          title: topicText.trim(),
          description: '暂无详细说明'
        })
      }
    }
    
    return topics.slice(0, 5) // 确保只返回5个选题
  }

  return (
    <>
      <button
        onClick={generateTopics}
        disabled={isGenerating}
        className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
      >
        {isGenerating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Lightbulb className="w-4 h-4" />
        )}
        生成选题
      </button>

      <TopicModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        topics={topics}
        originalItem={item}
        isLoading={isGenerating}
      />
    </>
  )
}