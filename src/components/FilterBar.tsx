'use client'

import { Search, Filter } from 'lucide-react'
import { FilterOptions } from '@/types'

interface FilterBarProps {
  filter: FilterOptions
  onFilterChange: (filter: FilterOptions) => void
}

export default function FilterBar({ filter, onFilterChange }: FilterBarProps) {
  const sources = [
    { value: 'all', label: '全部来源' },
    { value: 'rss', label: 'RSS微博' },
    { value: 'tianju', label: '天聚数行' },
    { value: 'bangyan', label: '榜眼数据' }
  ]

  const sortOptions = [
    { value: 'time', label: '按时间' },
    { value: 'hot', label: '按热度' }
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        {/* 来源筛选 */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={filter.source}
            onChange={(e) => onFilterChange({ ...filter, source: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {sources.map(source => (
              <option key={source.value} value={source.value}>
                {source.label}
              </option>
            ))}
          </select>
        </div>

        {/* 搜索框 */}
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索标题或内容..."
              value={filter.search}
              onChange={(e) => onFilterChange({ ...filter, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 排序 */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">排序:</span>
          <select
            value={filter.sortBy}
            onChange={(e) => onFilterChange({ ...filter, sortBy: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}