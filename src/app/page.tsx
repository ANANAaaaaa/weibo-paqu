'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, Download } from 'lucide-react'
import SimpleRSSCard from '@/components/SimpleRSSCard'
import TopicGenerator from '@/components/TopicGenerator'
import { useRSSStore } from '@/lib/stores/rssStore'
import { useHotItemsStore } from '@/lib/stores/hotItemsStore'

export default function HomePage() {
  const { 
    rssItems, 
    isLoading: rssLoading, 
    setRSSItems, 
    setLoading: setRSSLoading, 
    hasData: hasRSSData 
  } = useRSSStore()
  
  const {
    hotItems,
    isLoading: hotItemsLoading,
    setHotItems,
    setLoading: setHotItemsLoading
  } = useHotItemsStore()
  
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [filter, setFilter] = useState({
    source: 'bangyan_weibo',
    search: '',
    sortBy: 'time'
  })

  // 防止水合错误
  useEffect(() => {
    setMounted(true)
  }, [])

  const fetchHotItems = async (forceRefresh: boolean = false) => {
    setHotItemsLoading(true)
    try {
      const response = await fetch('/api/hot-items?' + new URLSearchParams({
        source: filter.source,
        search: filter.search,
        sortBy: filter.sortBy,
        page: '1',
        pageSize: '50'
      }))
      const data = await response.json()
      setHotItems(data.items || [])
    } catch (error) {
      console.error('获取热点数据失败:', error)
    } finally {
      setHotItemsLoading(false)
    }
  }

  const fetchRSSItems = async (forceRefresh: boolean = false) => {
    setRSSLoading(true)
    try {
      const params = new URLSearchParams({
        source: 'rss',
        search: '',
        sortBy: 'time',
        page: '1',
        pageSize: '100'
      })
      
      if (forceRefresh) {
        params.set('forceRefresh', 'true')
      }
      
      const response = await fetch('/api/hot-items?' + params)
      const data = await response.json()
      setRSSItems(data.items || [])
    } catch (error) {
      console.error('获取RSS数据失败:', error)
    } finally {
      setRSSLoading(false)
    }
  }

  const forceRefreshHotItems = async () => {
    setLoading(true)
    try {
      await fetchHotItems(true)
    } catch (error) {
      console.error('重新获取热点失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 只在组件挂载后且没有缓存数据时才获取，避免水合错误和重复请求
  useEffect(() => {
    if (mounted && hotItems.length === 0) {
      fetchHotItems()
    }
  }, [mounted])

  useEffect(() => {
    if (mounted) {
      fetchHotItems()
    }
  }, [filter, mounted])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">微博热点聚合</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={forceRefreshHotItems}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                重新获取热点
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* 顶部：其他热点标签栏 */}
        <div className="bg-white rounded-lg border p-3 mb-4">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'bangyan_weibo', label: '微博' },
              { key: 'bangyan_douyin', label: '抖音' },
              { key: 'bangyan_zhihu', label: '知乎' },
              { key: 'tianju_topnews', label: '天聚·要闻' },
              { key: 'tianju_huabian', label: '天聚·花边' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(prev => ({ ...prev, source: tab.key }))}
                className={`px-3 py-1.5 text-sm rounded-md border ${filter.source === tab.key ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 其他热点数据（在上方） */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">其他热点数据</h2>
          {hotItemsLoading ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-2">
              {hotItems.map(item => (
                <div key={item.id} className="bg-white rounded-lg border p-3 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-medium line-clamp-2">
                      {item.title}
                    </a>
                    <div className="mt-1 text-xs text-gray-500 flex items-center gap-2">
                      <span>{item.sourceName}</span>
                      {item.pubDate ? (<><span>•</span><span>{new Date(item.pubDate).toLocaleString('zh-CN')}</span></>) : null}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <TopicGenerator item={item as any} />
                  </div>
                </div>
              ))}
              {hotItems.length === 0 && (
                <div className="text-center py-8 text-gray-500 bg-white rounded-lg border">
                  暂无数据，请点击"重新获取热点"或切换上方标签
                </div>
              )}
            </div>
          )}
        </div>

        {/* RSS微博内容区域（在下方，手动按钮+缓存） */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">RSS微博内容</h2>
            <div className="flex items-center gap-2">
              {!hasRSSData() && (
                <button
                  onClick={() => fetchRSSItems(false)}
                  disabled={rssLoading}
                  className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <Download className={`w-4 h-4 ${rssLoading ? 'animate-spin' : ''}`} />
                  获取RSS微博数据
                </button>
              )}
              {hasRSSData() && (
                <button
                  onClick={() => fetchRSSItems(true)}
                  disabled={rssLoading}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${rssLoading ? 'animate-spin' : ''}`} />
                  重新获取RSS数据
                </button>
              )}
            </div>
          </div>
          
          {rssLoading && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          )}
          
          {hasRSSData() && !rssLoading && (
            <div className="space-y-2 max-h-96 overflow-y-auto bg-white rounded-lg border p-4">
              {rssItems.slice(0, 10).map((item) => (
                <SimpleRSSCard key={item.id} item={item} />
              ))}
              {rssItems.length > 10 && (
                <div className="text-center pt-2">
                  <a 
                    href="/rss" 
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    查看全部 {rssItems.length} 条RSS数据 →
                  </a>
                </div>
              )}
            </div>
          )}
          
          {!hasRSSData() && !rssLoading && (
            <div className="text-center py-8 text-gray-500 bg-white rounded-lg border">
              点击"获取RSS微博数据"按钮开始获取微博RSS数据
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
