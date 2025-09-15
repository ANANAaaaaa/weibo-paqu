'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, Download, Menu, X } from 'lucide-react'
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
  const [showMobileMenu, setShowMobileMenu] = useState(false)
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
      const response = await fetch('/api/hot-items?' + new URLSearchParams({
        source: 'rss',
        forceRefresh: forceRefresh.toString(),
        page: '1',
        pageSize: '100'
      }))
      const data = await response.json()
      setRSSItems(data.items || [])
    } catch (error) {
      console.error('获取RSS数据失败:', error)
    } finally {
      setRSSLoading(false)
    }
  }

  const forceRefreshHotItems = () => {
    setLoading(true)
    fetchHotItems(true).finally(() => setLoading(false))
  }

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

  const dataSourceTabs = [
    { key: 'bangyan_weibo', label: '微博' },
    { key: 'bangyan_douyin', label: '抖音' },
    { key: 'bangyan_zhihu', label: '知乎' },
    { key: 'tianju_topnews', label: '天聚·要闻' },
    { key: 'tianju_huabian', label: '天聚·花边' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 响应式头部 */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                微博热点聚合
              </h1>
            </div>
            
            {/* 桌面端按钮 */}
            <div className="hidden sm:flex items-center gap-3">
              <button
                onClick={forceRefreshHotItems}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden md:inline">重新获取热点</span>
                <span className="md:hidden">刷新</span>
              </button>
            </div>

            {/* 移动端菜单按钮 */}
            <div className="sm:hidden">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* 移动端下拉菜单 */}
          {showMobileMenu && (
            <div className="sm:hidden border-t bg-white py-3">
              <button
                onClick={() => {
                  forceRefreshHotItems()
                  setShowMobileMenu(false)
                }}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                重新获取热点
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* 响应式数据源标签栏 */}
        <div className="bg-white rounded-lg border p-3 sm:p-4 mb-4 sm:mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3 sm:hidden">选择数据源</h3>
          <div className="flex flex-wrap gap-2">
            {dataSourceTabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => {
                  setFilter(prev => ({ ...prev, source: tab.key }))
                  setShowMobileMenu(false)
                }}
                className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                  filter.source === tab.key 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 热点数据区域 - 响应式卡片布局 */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
            其他热点数据
          </h2>
          
          {hotItemsLoading ? (
            <div className="flex justify-center py-8 sm:py-12">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {hotItems.map(item => (
                <div key={item.id} className="bg-white rounded-lg border p-4 sm:p-5 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <a 
                        href={item.link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:text-blue-800 font-medium leading-relaxed block mb-2"
                      >
                        {item.title}
                      </a>
                      <div className="text-xs sm:text-sm text-gray-500 flex flex-wrap items-center gap-2">
                        <span className="bg-gray-100 px-2 py-1 rounded">{item.sourceName}</span>
                        {item.pubDate && (
                          <>
                            <span className="hidden sm:inline">•</span>
                            <span>{new Date(item.pubDate).toLocaleString('zh-CN')}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0 self-start">
                      <TopicGenerator item={item as any} />
                    </div>
                  </div>
                </div>
              ))}
              
              {hotItems.length === 0 && (
                <div className="text-center py-8 sm:py-12 text-gray-500 bg-white rounded-lg border">
                  <div className="text-sm sm:text-base">
                    暂无数据，请点击"重新获取热点"或切换上方标签
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RSS微博内容区域 - 响应式布局 */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">RSS微博内容</h2>
            <div className="flex items-center gap-2">
              {!hasRSSData() && (
                <button
                  onClick={() => fetchRSSItems(false)}
                  disabled={rssLoading}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm sm:text-base"
                >
                  <RefreshCw className={`w-4 h-4 ${rssLoading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">获取RSS数据</span>
                  <span className="sm:hidden">获取RSS</span>
                </button>
              )}
              {hasRSSData() && (
                <button
                  onClick={() => fetchRSSItems(true)}
                  disabled={rssLoading}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 text-sm sm:text-base"
                >
                  <RefreshCw className={`w-4 h-4 ${rssLoading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">强制刷新RSS</span>
                  <span className="sm:hidden">刷新RSS</span>
                </button>
              )}
            </div>
          </div>

          {rssLoading ? (
            <div className="flex justify-center py-8 sm:py-12">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-green-600"></div>
            </div>
          ) : rssItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {rssItems.map(item => (
                <SimpleRSSCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12 text-gray-500 bg-white rounded-lg border">
              <div className="text-sm sm:text-base mb-3">
                暂无RSS数据，点击上方按钮获取微博RSS内容
              </div>
              <div className="text-xs sm:text-sm text-gray-400">
                RSS数据包含精选微博用户的最新动态
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
