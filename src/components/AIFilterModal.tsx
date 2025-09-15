'use client'

import { X } from 'lucide-react'

interface AIFilterModalProps {
  isOpen: boolean
  onClose: () => void
  onFilter: (category: string) => void
}

const categories = [
  { value: '泛娱乐', label: '泛娱乐', description: '明星/影视综/大众情绪与社会话题的交叉' },
  { value: '电竞', label: '电竞', description: '赛事/选手/版本/战队' },
  { value: '二次元', label: '二次元', description: '动漫/ACG/宅文化' },
  { value: '广告内容', label: '广告内容', description: '品牌、营销节点或合作相关' },
  { value: '忽略', label: '忽略', description: '无关或噪音' }
]

export default function AIFilterModal({ isOpen, onClose, onFilter }: AIFilterModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">AI 内容筛选</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          选择一个类别，AI将从当前RSS列表中筛选出相关内容：
        </p>

        <div className="space-y-3">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => onFilter(category.value)}
              className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
            >
              <div className="font-medium text-gray-900 mb-1">
                {category.label}
              </div>
              <div className="text-sm text-gray-600">
                {category.description}
              </div>
            </button>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  )
}