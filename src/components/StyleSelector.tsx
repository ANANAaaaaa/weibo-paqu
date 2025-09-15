'use client'

import { AI_PROMPTS } from '@/lib/ai/prompts'

interface StyleSelectorProps {
  selectedStyle: string
  onStyleChange: (style: string) => void
}

const presetStyles = [
  {
    key: 'urbanObserver',
    name: '人间清醒都市观察员',
    description: '面向都市女性，真实理性，机智不挖苦'
  },
  {
    key: 'filmWorker',
    name: '影视民工爱吃瓜',
    description: '影视评论员人设，犀利点评与真情安利'
  },
  {
    key: 'surfingExpert',
    name: '5G冲浪课代表瓜瓜酱',
    description: '影视洞察官，专业性与传播性并重'
  }
]

export default function StyleSelector({ selectedStyle, onStyleChange }: StyleSelectorProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="font-semibold text-gray-900 mb-4">选择写作风格</h3>
      
      {/* 预设风格 */}
      <div className="space-y-3 mb-6">
        {presetStyles.map((style) => (
          <label key={style.key} className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="style"
              value={style.key}
              checked={selectedStyle === style.key}
              onChange={(e) => onStyleChange(e.target.value)}
              className="mt-1 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">{style.name}</div>
              <div className="text-sm text-gray-600">{style.description}</div>
            </div>
          </label>
        ))}
      </div>

      {/* 基础风格标签 */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">基础风格标签</h4>
        <div className="flex flex-wrap gap-2">
          {AI_PROMPTS.basicStyles.map((style) => (
            <label key={style} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="style"
                value={style}
                checked={selectedStyle === style}
                onChange={(e) => onStyleChange(e.target.value)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm px-3 py-1 bg-gray-100 rounded-full">
                {style}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}