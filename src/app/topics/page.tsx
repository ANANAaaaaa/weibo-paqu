'use client'

import { useState, useEffect } from 'react'
import { Plus, RefreshCw } from 'lucide-react'
import TopicCard from '@/components/TopicCard'
import { Topic, HotItem } from '@/types'

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [hotItems, setHotItems] = useState<HotItem[]>([])
  const [loading, setLoading] = useState(false)
  const [excludeIds, setExcludeIds] = useState<string[]>([])

  const fetchHotItems = async () => {
    try {
      const response = await fetch('/api/hot-items?pageSize=20')
      const data = await response.json()
      setHotItems(data.items || [])
    } catch (error) {
      console.error('获取热点数据失败:', error)
    }
  }

  const generateTopics = async () => {
    if (hotItems.length === 0) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/topics/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hotItems,
          excludeIds
        })
      })
      
      const result = await response.json()
      setTopics(result.topics || [])
    } catch (error) {
      console.error('选题生成失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const expandTopics = async () => {
    if (hotItems.length === 0) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/topics/expand', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hotItems,
          excludeIds,
          existingTopics: topics
        })
      })
      
      const result = await response.json()
      setTopics([...topics, ...(result.topics || [])])
    } catch (error) {
      console.error('选题扩展失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTopicSelect = (topic: Topic) => {
    // 跳转到写作页面
    const topicData = encodeURIComponent(JSON.stringify(topic))
    const hotItemsData = encodeURIComponent(JSON.stringify(hotItems))
    window.location.href = `/writing?topic=${topicData}&hotItems=${hotItemsData}`
  }

  useEffect(() => {
    fetchHotItems()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">AI 选题生成</h1>
            <div className="flex items-center gap-4">
              {topics.length > 0 && (
                <button
                  onClick={expandTopics}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  扩展 5 个
                </button>
              )}
              <button
                onClick={generateTopics}
                disabled={loading || hotItems.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                生成 5 个选题
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {hotItems.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800">
              正在加载热点数据...
            </p>
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic, index) => (
            <TopicCard
              key={index}
              topic={topic}
              hotItems={hotItems}
              onSelect={handleTopicSelect}
            />
          ))}
        </div>

        {topics.length === 0 && !loading && hotItems.length > 0 && (
          <div className="text-center py-12 text-gray-500">
            点击"生成 5 个选题"开始创建内容选题
          </div>
        )}
      </main>
    </div>
  )
}