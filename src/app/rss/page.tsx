'use client'

import { useState, useEffect } from 'react'
import { Filter, RefreshCw, Download } from 'lucide-react'
import SimpleRSSCard from '@/components/SimpleRSSCard'
import ContentCard from '@/components/ContentCard'
import FilterBar from '@/components/FilterBar'
import AIFilterModal from '@/components/AIFilterModal'
import { useRSSStore } from '@/lib/stores/rssStore'
import { useHotItemsStore } from '@/lib/stores/hotItemsStore'
import { RSSItem, HotItem } from '@/types'

export default function RSSPage() {
  const { 
    rssItems, 
    isLoading, 
    setRSSItems, 
    setLoading, 
    clearRSSItems, 
    hasData 
  } = useRSSStore()
  
  const {
    hotItems,
    hasData: hasHotItemsData
  } = useHotItemsStore()
  
  const [filteredItems, setFilteredItems] = useState<RSSItem[]>([])
  const [filteredHotItems, setFilteredHotItems] = useState<HotItem[]>([])
  const [showAIFilter, setShowAIFilter] = useState(false)
  const [isFiltered, setIsFiltered] = useState(false)
  const [filter, setFilter] = useState({
    source: 'rss',
    search: '',
    sortBy: 'time'
  })

  const fetchRSSItems = async (forceRefresh: boolean = false) => {
    setLoading(true)
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
      if (!isFiltered) {
        setFilteredItems(data.items || [])
      }
    } catch (error) {
      console.error('获取RSS数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAIFilter = async (category: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/ai/filter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: rssItems,
          category
        })
      })
      
      const result = await response.json()
      const filtered = rssItems.filter(item => 
        result.filteredIds.includes(item.id)
      )
      
      setFilteredItems(filtered)
      setIsFiltered(true)
      setShowAIFilter(false)
    } catch (error) {
      console.error('AI筛选失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetFilter = () => {
    setFilteredItems(rssItems)
    setIsFiltered(false)
  }

  // 初始化时设置过滤项
  useEffect(() => {
    if (!isFiltered) {
      setFilteredItems(rssItems)
    }
  }, [rssItems, isFiltered])

  // 处理搜索和排序
  useEffect(() => {
    let filtered = [...rssItems]
    
    // 搜索过滤
    if (filter.search) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(filter.search.toLowerCase()) ||
        (item.summary && item.summary.toLowerCase().includes(filter.search.toLowerCase()))
      )
    }
    
    // 排序
    if (filter.sortBy === 'time') {
      filtered.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
    }
    
    if (!isFiltered) {
      setFilteredItems(filtered)
    }
  }, [filter, rssItems, isFiltered])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">RSS 微博内容</h1>
            <div className="flex items-center gap-4">
              {!hasData() && (
                <button
                  onClick={() => fetchRSSItems(false)}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <Download className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  获取RSS微博数据
                </button>
              )}
              {hasData() && (
                <>
                  {isFiltered && (
                    <button
                      onClick={resetFilter}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      查看全部
                    </button>
                  )}
                  <button
                    onClick={() => setShowAIFilter(true)}
                    disabled={isLoading || rssItems.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    <Filter className="w-4 h-4" />
                    AI筛选
                  </button>
                  <button
                    onClick={() => fetchRSSItems(true)}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    强制刷新
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <FilterBar filter={filter} onFilterChange={setFilter} />
        
        {isFiltered && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
            <p className="text-purple-800">
              已通过AI筛选，显示 {filteredItems.length} 条相关内容
            </p>
          </div>
        )}
        
        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        <div className="space-y-3">
          {filteredItems.map((item) => (
            <SimpleRSSCard key={item.id} item={item} />
          ))}
        </div>

        {filteredItems.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-500">
            {!hasData() ? '点击"获取RSS微博数据"按钮开始获取数据' : 
             isFiltered ? '没有找到符合条件的内容' : '暂无RSS数据'}
          </div>
        )}
      </main>

      <AIFilterModal
        isOpen={showAIFilter}
        onClose={() => setShowAIFilter(false)}
        onFilter={handleAIFilter}
      />
    </div>
  )
}