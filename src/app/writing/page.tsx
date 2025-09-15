'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Save, AlertTriangle, RefreshCw } from 'lucide-react'
import StyleSelector from '@/components/StyleSelector'
import ViolationChecker from '@/components/ViolationChecker'
import { Topic, HotItem, Draft } from '@/types'

export default function WritingPage() {
  const searchParams = useSearchParams()
  const [topic, setTopic] = useState<Topic | null>(null)
  const [hotItems, setHotItems] = useState<HotItem[]>([])
  const [selectedStyle, setSelectedStyle] = useState('')
  const [draft, setDraft] = useState<Draft | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const topicParam = searchParams.get('topic')
    const hotItemsParam = searchParams.get('hotItems')
    
    if (topicParam) {
      try {
        setTopic(JSON.parse(decodeURIComponent(topicParam)))
      } catch (error) {
        console.error('解析选题数据失败:', error)
      }
    }
    
    if (hotItemsParam) {
      try {
        setHotItems(JSON.parse(decodeURIComponent(hotItemsParam)))
      } catch (error) {
        console.error('解析热点数据失败:', error)
      }
    }
  }, [searchParams])

  const generateDraft = async () => {
    if (!topic || !selectedStyle) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/writing/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          topic,
          style: selectedStyle,
          hotItems
        })
      })
      
      const result = await response.json()
      setDraft(result.draft)
    } catch (error) {
      console.error('文案生成失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateDraftContent = (newContent: string) => {
    if (!draft) return
    
    const updatedDraft = {
      ...draft,
      content: newContent,
      versions: {
        items: [
          {
            content: newContent,
            createdAt: new Date().toISOString()
          },
          ...draft.versions.items.slice(0, 1) // 保持最多2个版本
        ]
      }
    }
    setDraft(updatedDraft)
  }

  const finalizeDraft = () => {
    if (!draft) return
    
    const finalizedDraft = {
      ...draft,
      finalized: true
    }
    setDraft(finalizedDraft)
    
    // 这里可以添加保存到数据库的逻辑
    alert('文案已保存为最终稿！')
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">未找到选题数据</p>
          <a
            href="/topics"
            className="text-blue-600 hover:text-blue-700"
          >
            返回选题页面
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI 文案写作</h1>
              <p className="text-gray-600 mt-1">{topic.title}</p>
            </div>
            <div className="flex items-center gap-4">
              {draft && !draft.finalized && (
                <button
                  onClick={finalizeDraft}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Save className="w-4 h-4" />
                  保存最终稿
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：选题信息和风格选择 */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-3">选题信息</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">标题</label>
                  <p className="text-gray-900">{topic.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">角度</label>
                  <p className="text-gray-600 text-sm">{topic.angle}</p>
                </div>
              </div>
            </div>

            <StyleSelector
              selectedStyle={selectedStyle}
              onStyleChange={setSelectedStyle}
            />

            <button
              onClick={generateDraft}
              disabled={loading || !selectedStyle}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {draft ? '重新生成' : '生成初稿'}
            </button>
          </div>

          {/* 右侧：文案编辑和违禁词检测 */}
          <div className="lg:col-span-2 space-y-6">
            {draft && (
              <>
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">文案内容</h3>
                    {draft.finalized && (
                      <span className="flex items-center gap-1 text-green-600 text-sm">
                        <Save className="w-4 h-4" />
                        已保存
                      </span>
                    )}
                  </div>
                  
                  <textarea
                    value={draft.content}
                    onChange={(e) => updateDraftContent(e.target.value)}
                    disabled={draft.finalized}
                    className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                    placeholder="文案内容将在这里显示..."
                  />
                  
                  <div className="mt-4 text-sm text-gray-500">
                    字数: {draft.content.length} / 400
                  </div>
                </div>

                <ViolationChecker
                  content={draft.content}
                  onContentUpdate={updateDraftContent}
                />

                {/* 版本历史 */}
                {draft.versions.items.length > 1 && (
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">版本历史</h3>
                    <div className="space-y-3">
                      {draft.versions.items.map((version, index) => (
                        <div key={index} className="border-l-4 border-blue-200 pl-4">
                          <div className="text-sm text-gray-500 mb-2">
                            版本 {index + 1} - {new Date(version.createdAt).toLocaleString()}
                          </div>
                          <p className="text-sm text-gray-700 line-clamp-3">
                            {version.content}
                          </p>
                          {index > 0 && (
                            <button
                              onClick={() => updateDraftContent(version.content)}
                              className="text-blue-600 hover:text-blue-700 text-sm mt-2"
                            >
                              恢复此版本
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {!draft && (
              <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                <p className="text-gray-500 mb-4">选择写作风格后点击"生成初稿"开始创作</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}